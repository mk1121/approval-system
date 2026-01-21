import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';
import { sendApprovalEmail } from '@/lib/email';
import oracledb from 'oracledb';

// GET: Fetch pending requests for the app (where APP_FLAG = 'y' and STATUS = 'P')
export async function GET() {
    try {
        const result = await execute(
            `SELECT * FROM APPROVAL_REQUESTS WHERE STATUS = 'P' AND APP_FLAG = 'y' ORDER BY CREATED_AT DESC`
        );
        // oracledb outFormat object returns rows as objects
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
    }
}

// POST: Insert a new approval request
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { request_data, app_flag, email_flag, user_email } = body;

        // Validate flags
        const app = app_flag === 'y' ? 'y' : 'n';
        const email = email_flag === 'y' ? 'y' : 'n';

        // Insert into DB
        const sql = `
      INSERT INTO APPROVAL_REQUESTS (REQUEST_DATA, APP_FLAG, EMAIL_FLAG, USER_EMAIL, STATUS)
      VALUES (:request_data, :app_flag, :email_flag, :user_email, 'P')
      RETURNING ID INTO :id
    `;

        const result = await execute(sql, {
            request_data: JSON.stringify(request_data),
            app_flag: app,
            email_flag: email,
            user_email,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        });

        // @ts-ignore - oracledb typing for outBinds can be tricky, assumes array
        const newId = result.outBinds.id[0];

        // Handle Email
        if (email === 'y' && user_email) {
            await sendApprovalEmail(user_email, request_data, newId);
        }

        // Fetch the newly created request to return
        const fetchSql = `SELECT * FROM APPROVAL_REQUESTS WHERE ID = :id`;
        const fetchResult = await execute(fetchSql, { id: newId });
        const createdRequest = fetchResult.rows?.[0];

        return NextResponse.json(createdRequest, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }
}
