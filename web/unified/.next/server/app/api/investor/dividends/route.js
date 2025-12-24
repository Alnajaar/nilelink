"use strict";(()=>{var t={};t.id=740,t.ids=[740],t.modules={399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:t=>{t.exports=import("pg")},3882:(t,e,r)=>{r.a(t,async(t,a)=>{try{r.r(e),r.d(e,{originalPathname:()=>R,patchFetch:()=>o,requestAsyncStorage:()=>l,routeModule:()=>c,serverHooks:()=>_,staticGenerationAsyncStorage:()=>E});var s=r(9303),n=r(8716),i=r(670),u=r(8145),d=t([u]);u=(d.then?(await d)():d)[0];let c=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/investor/dividends/route",pathname:"/api/investor/dividends",filename:"route",bundlePath:"app/api/investor/dividends/route"},resolvedPagePath:"C:\\Users\\nilel\\Projects\\Sduan\\New folder\\nilelink\\frontend\\src\\app\\api\\investor\\dividends\\route.ts",nextConfigOutput:"export",userland:u}),{requestAsyncStorage:l,staticGenerationAsyncStorage:E,serverHooks:_}=c,R="/api/investor/dividends/route";function o(){return(0,i.patchFetch)({serverHooks:_,staticGenerationAsyncStorage:E})}a()}catch(t){a(t)}})},8145:(t,e,r)=>{r.a(t,async(t,a)=>{try{r.r(e),r.d(e,{GET:()=>u,POST:()=>d});var s=r(7070),n=r(5748),i=t([n]);async function u(t){try{let e=t.nextUrl.searchParams.get("walletAddress"),r=parseInt(t.nextUrl.searchParams.get("limit")||"100");if(!e)return s.NextResponse.json({error:"Wallet address is required"},{status:400});let a=await n.v.getInvestorByWallet(e);if(!a)return s.NextResponse.json({error:"Investor not found"},{status:404});let i=await n.v.getDividendHistory(a.id,r),u=await n.v.getAccruedDividends(a.id),d=i.filter(t=>"paid"===t.status).reduce((t,e)=>t+parseInt(e.amount_usd6),0),o=i.filter(t=>"pending"===t.status).reduce((t,e)=>t+parseInt(e.amount_usd6),0),c={accruedDividends:u,totalPaid:d,totalPending:o,recentDividends:i.slice(0,10),dividendHistory:i,lastUpdated:new Date().toISOString()};return s.NextResponse.json(c)}catch(t){return console.error("Error fetching dividends:",t),s.NextResponse.json({error:"Internal server error"},{status:500})}}async function d(t){try{let{walletAddress:e,restaurantId:r,amount:a}=await t.json();if(!e||!r||!a)return s.NextResponse.json({error:"Missing required parameters"},{status:400});let i=await n.v.getInvestorByWallet(e);if(!i)return s.NextResponse.json({error:"Investor not found"},{status:404});if(await n.v.getAccruedDividends(i.id)<a)return s.NextResponse.json({error:"Insufficient accrued dividends"},{status:400});return s.NextResponse.json({success:!0,amount:a,transactionHash:"0x"+Math.random().toString(16).substr(2,64),message:"Dividend withdrawal initiated"})}catch(t){return console.error("Error withdrawing dividends:",t),s.NextResponse.json({error:"Internal server error"},{status:500})}}n=(i.then?(await i)():i)[0],a()}catch(t){a(t)}})},5748:(t,e,r)=>{r.a(t,async(t,a)=>{try{r.d(e,{v:()=>u});var s=r(8678),n=t([s]);let i=new(s=(n.then?(await n)():n)[0]).Pool({user:process.env.DB_USER||"postgres",host:process.env.DB_HOST||"localhost",database:process.env.DB_NAME||"nilelink",password:process.env.DB_PASSWORD||"password",port:parseInt(process.env.DB_PORT||"5432")});class u{static async getClient(){try{return await i.connect()}catch(t){return{query:async()=>({rows:[]}),release:()=>{}}}}static async getInvestorByWallet(t){return(await i.query("SELECT * FROM investors WHERE wallet_address = $1",[t])).rows[0]||null}static async getInvestorPortfolio(t){let e=`
      SELECT 
        i.*,
        r.name as restaurant_name,
        r.restaurant_address,
        r.country,
        r.local_currency
      FROM investments i
      JOIN restaurants r ON i.restaurant_id = r.id
      WHERE i.investor_id = $1
    `;return(await i.query(e,[t])).rows}static async getInvestorPortfolioSummary(t){let e=`
      SELECT 
        SUM(i.amount_usd6) as total_invested,
        SUM(i.ownership_bps) as total_ownership_bps,
        COUNT(i.id) as restaurant_count,
        COALESCE(SUM(d.amount_usd6), 0) as total_dividends
      FROM investments i
      LEFT JOIN dividends d ON i.id = d.investment_id AND d.status = 'paid'
      WHERE i.investor_id = $1
    `;return(await i.query(e,[t])).rows[0]}static async getRestaurantKPIs(t,e=30){let r=`
      SELECT *
      FROM restaurant_kpis
      WHERE restaurant_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${e} days'
      ORDER BY date DESC
    `;return(await i.query(r,[t])).rows}static async getRestaurantLatestKPI(t){let e=`
      SELECT *
      FROM restaurant_kpis
      WHERE restaurant_id = $1
      ORDER BY date DESC
      LIMIT 1
    `;return(await i.query(e,[t])).rows[0]||null}static async getRestaurantMetrics(t){let e=`
      SELECT 
        SUM(revenue_usd6) as total_revenue,
        SUM(profit_usd6) as total_profit,
        SUM(customers_count) as total_customers,
        SUM(orders_count) as total_orders,
        AVG(delivery_success_rate) as avg_delivery_success
      FROM restaurant_kpis
      WHERE restaurant_id = $1
      AND date >= CURRENT_DATE - INTERVAL '30 days'
    `;return(await i.query(e,[t])).rows[0]}static async getDividendHistory(t,e=100){let r=`
      SELECT 
        d.*,
        i.amount_usd6 as investment_amount,
        r.name as restaurant_name,
        r.restaurant_address
      FROM dividends d
      JOIN investments i ON d.investment_id = i.id
      JOIN restaurants r ON i.restaurant_id = r.id
      WHERE i.investor_id = $1
      ORDER BY d.created_at DESC
      LIMIT $2
    `;return(await i.query(r,[t,e])).rows}static async getAccruedDividends(t){let e=`
      SELECT 
        COALESCE(SUM(d.amount_usd6), 0) as accrued_dividends
      FROM dividends d
      JOIN investments i ON d.investment_id = i.id
      WHERE i.investor_id = $1
      AND d.status = 'pending'
    `;return(await i.query(e,[t])).rows[0].accrued_dividends}static async getAllRestaurants(t){let e="SELECT * FROM restaurants WHERE status = $1",r=["active"];return t&&(e+=" AND chain_id = $2",r.push(t.toString())),(await i.query(e,r)).rows}static async getRestaurantChain(t){return(await i.query("SELECT * FROM restaurant_chains WHERE id = $1",[t])).rows[0]||null}static async getChainMetrics(t){let e=`
      SELECT 
        COUNT(DISTINCT r.id) as restaurant_count,
        COUNT(DISTINCT r.country) as country_count,
        SUM(k.revenue_usd6) as total_revenue,
        SUM(k.profit_usd6) as total_profit,
        AVG(k.delivery_success_rate) as avg_delivery_success,
        SUM(k.customers_count) as total_customers,
        SUM(k.orders_count) as total_orders
      FROM restaurants r
      JOIN restaurant_kpis k ON r.id = k.restaurant_id
      WHERE r.chain_id = $1
      AND k.date >= CURRENT_DATE - INTERVAL '30 days'
    `;return(await i.query(e,[t])).rows[0]}static async getAlerts(t,e,r=50){let a=`
      SELECT a.*, r.name as restaurant_name
      FROM alerts a
      JOIN restaurants r ON a.restaurant_id = r.id
      WHERE resolved_at IS NULL
    `,s=[];return t&&(s.push(t),a+=` AND a.restaurant_id = $${s.length}`),e&&(s.push(e),a+=` AND a.severity = $${s.length}`),a+=` ORDER BY a.created_at DESC LIMIT $${s.length+1}`,s.push(r),(await i.query(a,s)).rows}static async createAlert(t){let e=`
      INSERT INTO alerts (restaurant_id, alert_type, severity, message, metadata)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;return(await i.query(e,[t.restaurant_id,t.alert_type,t.severity,t.message,JSON.stringify(t.metadata||{})])).rows[0]}static async resolveAlert(t){let e=`
      UPDATE alerts 
      SET resolved_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;return(await i.query(e,[t])).rows[0]}static async getStaffAccounts(t){let e=`
      SELECT s.*, r.name as restaurant_name
      FROM staff_accounts s
      JOIN restaurants r ON s.restaurant_id = r.id
      WHERE s.status = $1
    `,r=["active"];return t&&(r.push(t.toString()),e+=` AND s.restaurant_id = $${r.length}`),e+=" ORDER BY s.created_at DESC",(await i.query(e,r)).rows}static async createStaffAccount(t){let e=`
      INSERT INTO staff_accounts (restaurant_id, email, role, permissions)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;return(await i.query(e,[t.restaurant_id,t.email,t.role,JSON.stringify(t.permissions||{})])).rows[0]}static async updateStaffAccount(t,e){let r=Object.keys(e).map((t,e)=>`${t} = $${e+2}`).join(", "),a=[t,...Object.values(e)],s=`UPDATE staff_accounts SET ${r} WHERE id = $1 RETURNING *`;return(await i.query(s,a)).rows[0]}static async getExchangeRates(t,e=100){let r=`
      SELECT *
      FROM exchange_rates
      WHERE restaurant_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;return(await i.query(r,[t,e])).rows}static async updateExchangeRate(t,e,r,a="chainlink"){let s=`
      INSERT INTO exchange_rates (restaurant_id, currency_pair, rate, source)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;return(await i.query(s,[t,e,r,a])).rows[0]}static async getTransactionAuditLog(t,e=100){let r=`
      SELECT *
      FROM transaction_audit_log
      WHERE 1=1
    `,a=[];return t&&(a.push(t),r+=` AND restaurant_id = $${a.length}`),r+=` ORDER BY created_at DESC LIMIT $${a.length+1}`,a.push(e),(await i.query(r,a)).rows}static async addToAuditLog(t,e,r,a){let s=`
      INSERT INTO transaction_audit_log (restaurant_id, tx_hash, event_type, event_data, block_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;return(await i.query(s,[t,e,r,JSON.stringify(a||{}),0])).rows[0]}static async updateRestaurant(t,e){return null}static async getRestaurantById(t){return null}static async getChainByRestaurantId(t){return null}}a()}catch(t){a(t)}})}};var e=require("../../../../webpack-runtime.js");e.C(t);var r=t=>e(e.s=t),a=e.X(0,[276,972],()=>r(3882));module.exports=a})();