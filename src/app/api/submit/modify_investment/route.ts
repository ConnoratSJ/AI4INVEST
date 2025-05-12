// src/app/api/modify_investment/route.ts
//'use client';
import {  writeFile, mkdir, readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import path from 'path';


const usersFile = path.join(process.cwd(), 'data', 'data.json');

export async function POST(req: Request) {
    console.log('modify investment requested');
  try {
    const { username, bought, sold, deposited, withdrawn } = await req.json();
    
    const content = await readFile(usersFile, 'utf-8');
    const users = JSON.parse(content) as { email: string; password: string; username: string;  risk_bucket:string; cash_balance:string; invested_balance:string}[];

    const foundUserIndex = users.findIndex(
      (user) => user.username === username
    );
    const foundUser = users[foundUserIndex];

    if (!foundUser) {
      return NextResponse.json({ message: 'user not found' }, { status: 401 });
    }
    console.log('valid user')
    if(parseFloat(sold) - parseInt(bought) > parseFloat(foundUser.invested_balance)){
        return NextResponse.json({ message: 'Cannot sell more than invested balance' }, { status: 400 });
    }
    console.log('not overdrawing investment')
    if(parseFloat(withdrawn) - parseInt(deposited)+parseFloat(bought) - parseInt(sold) > parseFloat(foundUser.cash_balance)){
        return NextResponse.json({ message: 'Not enough cash balance' }, { status: 400 });
    }
    console.log('not overdrawing balance')
    console.log("cash balance: " + foundUser.cash_balance);
    console.log("invested balance: " + foundUser.invested_balance);
    console.log("buy transaction: " + bought);
    console.log("sell transaction: " + sold);
    console.log("deposit transaction: " + deposited);
    console.log("withdraw transaction: " + withdrawn);

    const cash_balance_net_change = parseFloat(deposited)-parseFloat(withdrawn)+parseFloat(sold)-parseFloat(bought);
    const invested_balance_net_change = parseFloat(bought)-parseFloat(sold);
    console.log('cash_balance_net_change ' + cash_balance_net_change.toString())
    console.log('invested_balance_net_change ' + invested_balance_net_change.toString())

    foundUser.cash_balance = (parseFloat(foundUser.cash_balance)+cash_balance_net_change).toString();
    foundUser.invested_balance = (parseFloat(foundUser.invested_balance)+invested_balance_net_change).toString();

    users[foundUserIndex] = foundUser;

    console.log('new cash balance ' + foundUser.cash_balance);
    console.log('new investment balance ' + foundUser.invested_balance);

    await writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8');
    
    return NextResponse.json({ message: 'Transaction successful', username: foundUser.username, invested_balance:foundUser.invested_balance, cash_balance:foundUser.cash_balance}, { status: 200 });

  } catch (error) {
    console.error('transaction error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
