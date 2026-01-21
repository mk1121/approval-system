import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(request: Request) {
    try {
        const { id, action } = await request.json();

        if (!id || !['approve', 'reject'].includes(action)) {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        const newStatus = action === 'approve' ? 'A' : 'R';

        const sql = `UPDATE APPROVAL_REQUESTS SET STATUS = :status WHERE ID = :id`;

        await execute(sql, { status: newStatus, id });

        return NextResponse.json({ message: `Request ${action}ed successfully` });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to process approval' }, { status: 500 });
    }
}
