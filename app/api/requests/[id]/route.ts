import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const id = (await params).id;

        if (!id) {
            return NextResponse.json({ error: 'ID is required' }, { status: 400 });
        }

        const sql = `SELECT ID, STATUS, REQUEST_DATA, APP_FLAG, EMAIL_FLAG, USER_EMAIL, CREATED_AT FROM APPROVAL_REQUESTS WHERE ID = :id`;
        const result = await execute(sql, { id });

        if (result.rows && result.rows.length > 0) {
            return NextResponse.json(result.rows[0]);
        } else {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }
    } catch (error) {
        console.error('Error fetching request status:', error);
        return NextResponse.json({ error: 'Failed to fetch request status' }, { status: 500 });
    }
}
