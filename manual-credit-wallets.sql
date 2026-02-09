-- Script to manually credit doctor wallets for paid invoices
-- Run this on your live server after manually marking invoices as PAID

-- Step 1: View invoices that are PAID but may not have credited wallets
SELECT 
    inv.id AS invoice_id,
    inv.invoiceNumber,
    inv.totalAmount,
    inv.commissionAmount,
    inv.status,
    inv.doctorId,
    d.email AS doctor_email,
    d.fname AS doctor_name,
    u.id AS user_id,
    w.balance AS current_wallet_balance
FROM invoices inv
LEFT JOIN doctors d ON inv.doctorId = d.id
LEFT JOIN users u ON d.email = u.email
LEFT JOIN wallets w ON u.id = w.user_id
WHERE inv.status = 'paid' 
  AND inv.doctorId IS NOT NULL
  AND (inv.invoiceNumber LIKE 'INV-%' OR inv.appointmentId IS NOT NULL)
ORDER BY inv.createdAt DESC
LIMIT 20;

-- Step 2: Calculate and credit wallets for PAID invoices
-- Replace {INVOICE_ID} with the actual invoice ID you want to credit

-- For a single invoice:
SET @invoice_id = 123; -- CHANGE THIS to your invoice ID
SET @total_amount = (SELECT totalAmount FROM invoices WHERE id = @invoice_id);
SET @commission = @total_amount * 0.40;
SET @doctor_share = @total_amount * 0.60;
SET @doctor_id = (SELECT doctorId FROM invoices WHERE id = @invoice_id);
SET @doctor_email = (SELECT email FROM doctors WHERE id = @doctor_id);
SET @user_id = (SELECT id FROM users WHERE email = @doctor_email);
SET @invoice_number = (SELECT invoiceNumber FROM invoices WHERE id = @invoice_id);

-- Update commission on invoice
UPDATE invoices 
SET commissionAmount = @commission 
WHERE id = @invoice_id;

-- Credit wallet
UPDATE wallets 
SET balance = balance + @doctor_share,
    updatedAt = NOW()
WHERE user_id = @user_id;

-- Confirm appointment
UPDATE appointment 
SET status = 'confirmed'
WHERE id = (SELECT appointmentId FROM invoices WHERE id = @invoice_id)
  AND status != 'confirmed';

-- Create transaction record
INSERT INTO transactions (amount, source, reference, status, invoice_id, createdAt, updatedAt)
VALUES (
    @total_amount,
    'MANUAL',
    CONCAT('MAN-', @invoice_id, '-', UNIX_TIMESTAMP()),
    'completed',
    @invoice_id,
    NOW(),
    NOW()
);

-- Verify the wallet was credited
SELECT 
    u.email,
    u.fname,
    w.balance AS wallet_balance,
    @doctor_share AS amount_credited,
    @invoice_number AS for_invoice
FROM wallets w
JOIN users u ON w.user_id = u.id
WHERE w.user_id = @user_id;


-- ============================================
-- BATCH PROCESS: Credit ALL unpaid doctor shares
-- ============================================
-- CAUTION: This will credit ALL invoices marked as PAID
-- Run this if you want to process multiple invoices at once

-- Uncomment the lines below to run batch processing:

/*
-- Create temporary table for calculations
CREATE TEMPORARY TABLE temp_credits AS
SELECT 
    inv.id AS invoice_id,
    inv.invoiceNumber,
    inv.totalAmount,
    inv.totalAmount * 0.60 AS doctor_share,
    inv.totalAmount * 0.40 AS commission,
    inv.doctorId,
    d.email AS doctor_email,
    u.id AS user_id,
    inv.appointmentId
FROM invoices inv
JOIN doctors d ON inv.doctorId = d.id
JOIN users u ON d.email = u.email
WHERE inv.status = 'paid'
  AND inv.doctorId IS NOT NULL
  AND (inv.invoiceNumber LIKE 'INV-%' OR inv.appointmentId IS NOT NULL)
  AND (inv.commissionAmount IS NULL OR inv.commissionAmount = 0);

-- Update commissions
UPDATE invoices inv
JOIN temp_credits tc ON inv.id = tc.invoice_id
SET inv.commissionAmount = tc.commission;

-- Credit wallets
UPDATE wallets w
JOIN (
    SELECT user_id, SUM(doctor_share) AS total_credit
    FROM temp_credits
    GROUP BY user_id
) tc ON w.user_id = tc.user_id
SET w.balance = w.balance + tc.total_credit,
    w.updatedAt = NOW();

-- Confirm appointments
UPDATE appointment a
JOIN temp_credits tc ON a.id = tc.appointmentId
SET a.status = 'confirmed'
WHERE a.status != 'confirmed';

-- Create transaction records
INSERT INTO transactions (amount, source, reference, status, invoice_id, createdAt, updatedAt)
SELECT 
    totalAmount,
    'MANUAL',
    CONCAT('BATCH-', invoice_id, '-', UNIX_TIMESTAMP()),
    'completed',
    invoice_id,
    NOW(),
    NOW()
FROM temp_credits;

-- Show results
SELECT 
    d.email,
    d.fname,
    COUNT(*) AS invoices_credited,
    SUM(tc.doctor_share) AS total_credited,
    w.balance AS new_balance
FROM temp_credits tc
JOIN doctors d ON tc.doctorId = d.id
JOIN wallets w ON tc.user_id = w.user_id
GROUP BY d.id, d.email, d.fname, w.balance;

DROP TEMPORARY TABLE temp_credits;
*/
