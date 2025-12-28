
async function reconcile() {
    try {
        console.log('Triggering Reconciliation for Doctor ID 1...');
        const response = await fetch('http://localhost:3001/financial/reconcile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ doctorId: 1 })
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e);
    }
}

reconcile();
