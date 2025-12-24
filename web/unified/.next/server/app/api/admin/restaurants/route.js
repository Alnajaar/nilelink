"use strict";(()=>{var t={};t.id=749,t.ids=[749],t.modules={399:t=>{t.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},517:t=>{t.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},8678:t=>{t.exports=import("pg")},6277:(t,e,a)=>{a.a(t,async(t,r)=>{try{a.r(e),a.d(e,{originalPathname:()=>R,patchFetch:()=>c,requestAsyncStorage:()=>l,routeModule:()=>d,serverHooks:()=>E,staticGenerationAsyncStorage:()=>_});var s=a(9303),n=a(8716),i=a(670),u=a(4215),o=t([u]);u=(o.then?(await o)():o)[0];let d=new s.AppRouteRouteModule({definition:{kind:n.x.APP_ROUTE,page:"/api/admin/restaurants/route",pathname:"/api/admin/restaurants",filename:"route",bundlePath:"app/api/admin/restaurants/route"},resolvedPagePath:"C:\\Users\\nilel\\Projects\\Sduan\\New folder\\nilelink\\frontend\\src\\app\\api\\admin\\restaurants\\route.ts",nextConfigOutput:"export",userland:u}),{requestAsyncStorage:l,staticGenerationAsyncStorage:_,serverHooks:E}=d,R="/api/admin/restaurants/route";function c(){return(0,i.patchFetch)({serverHooks:E,staticGenerationAsyncStorage:_})}r()}catch(t){r(t)}})},4215:(t,e,a)=>{a.a(t,async(t,r)=>{try{a.r(e),a.d(e,{GET:()=>u,POST:()=>o,PUT:()=>c});var s=a(7070),n=a(5748),i=t([n]);async function u(t){try{let e=t.nextUrl.searchParams.get("chainId"),a=e?parseInt(e):void 0,r=await n.v.getAllRestaurants(a),i=await Promise.all(r.map(async t=>{let e=await n.v.getRestaurantLatestKPI(t.id),a=await n.v.getRestaurantMetrics(t.id);return{...t,latestKPIs:e,totalRevenue30d:a.total_revenue||0,totalProfit30d:a.total_profit||0,totalCustomers30d:a.total_customers||0,totalOrders30d:a.total_orders||0,avgDeliverySuccess:a.avg_delivery_success||0}}));return s.NextResponse.json({restaurants:i,count:i.length,lastUpdated:new Date().toISOString()})}catch(t){return console.error("Error fetching restaurants:",t),s.NextResponse.json({error:"Internal server error"},{status:500})}}async function o(t){try{let e=await t.json(),a=["restaurant_address","chain_id","name","country","local_currency"].filter(t=>!e[t]);if(a.length>0)return s.NextResponse.json({error:`Missing required fields: ${a.join(", ")}`},{status:400});let r=`
      INSERT INTO restaurants (restaurant_address, chain_id, name, country, local_currency, daily_rate_limit_usd6, tax_bps, chainlink_oracle)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,i=[e.restaurant_address,e.chain_id,e.name,e.country,e.local_currency,e.daily_rate_limit_usd6||1e10,e.tax_bps||1e3,e.chainlink_oracle||"0x0000000000000000000000000000000000000000"],u=await n.v.getClient(),o=await u.query(r,i);return s.NextResponse.json({success:!0,restaurant:o.rows[0],message:"Restaurant created successfully"})}catch(t){return console.error("Error creating restaurant:",t),s.NextResponse.json({error:"Internal server error"},{status:500})}}async function c(t){try{let{restaurantId:e,updates:a}=await t.json();if(!e||!a)return s.NextResponse.json({error:"Missing required parameters"},{status:400});let r=await n.v.updateRestaurant(e,a);if(!r)return s.NextResponse.json({error:"Restaurant not found"},{status:404});return s.NextResponse.json({success:!0,restaurant:r,message:"Restaurant updated successfully"})}catch(t){return console.error("Error updating restaurant:",t),s.NextResponse.json({error:"Internal server error"},{status:500})}}n=(i.then?(await i)():i)[0],r()}catch(t){r(t)}})},5748:(t,e,a)=>{a.a(t,async(t,r)=>{try{a.d(e,{v:()=>u});var s=a(8678),n=t([s]);let i=new(s=(n.then?(await n)():n)[0]).Pool({user:process.env.DB_USER||"postgres",host:process.env.DB_HOST||"localhost",database:process.env.DB_NAME||"nilelink",password:process.env.DB_PASSWORD||"password",port:parseInt(process.env.DB_PORT||"5432")});class u{static async getClient(){try{return await i.connect()}catch(t){return{query:async()=>({rows:[]}),release:()=>{}}}}static async getInvestorByWallet(t){return(await i.query("SELECT * FROM investors WHERE wallet_address = $1",[t])).rows[0]||null}static async getInvestorPortfolio(t){let e=`
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
    `;return(await i.query(e,[t])).rows[0]}static async getRestaurantKPIs(t,e=30){let a=`
      SELECT *
      FROM restaurant_kpis
      WHERE restaurant_id = $1
      AND date >= CURRENT_DATE - INTERVAL '${e} days'
      ORDER BY date DESC
    `;return(await i.query(a,[t])).rows}static async getRestaurantLatestKPI(t){let e=`
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
    `;return(await i.query(e,[t])).rows[0]}static async getDividendHistory(t,e=100){let a=`
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
    `;return(await i.query(a,[t,e])).rows}static async getAccruedDividends(t){let e=`
      SELECT 
        COALESCE(SUM(d.amount_usd6), 0) as accrued_dividends
      FROM dividends d
      JOIN investments i ON d.investment_id = i.id
      WHERE i.investor_id = $1
      AND d.status = 'pending'
    `;return(await i.query(e,[t])).rows[0].accrued_dividends}static async getAllRestaurants(t){let e="SELECT * FROM restaurants WHERE status = $1",a=["active"];return t&&(e+=" AND chain_id = $2",a.push(t.toString())),(await i.query(e,a)).rows}static async getRestaurantChain(t){return(await i.query("SELECT * FROM restaurant_chains WHERE id = $1",[t])).rows[0]||null}static async getChainMetrics(t){let e=`
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
    `;return(await i.query(e,[t])).rows[0]}static async getAlerts(t,e,a=50){let r=`
      SELECT a.*, r.name as restaurant_name
      FROM alerts a
      JOIN restaurants r ON a.restaurant_id = r.id
      WHERE resolved_at IS NULL
    `,s=[];return t&&(s.push(t),r+=` AND a.restaurant_id = $${s.length}`),e&&(s.push(e),r+=` AND a.severity = $${s.length}`),r+=` ORDER BY a.created_at DESC LIMIT $${s.length+1}`,s.push(a),(await i.query(r,s)).rows}static async createAlert(t){let e=`
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
    `,a=["active"];return t&&(a.push(t.toString()),e+=` AND s.restaurant_id = $${a.length}`),e+=" ORDER BY s.created_at DESC",(await i.query(e,a)).rows}static async createStaffAccount(t){let e=`
      INSERT INTO staff_accounts (restaurant_id, email, role, permissions)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;return(await i.query(e,[t.restaurant_id,t.email,t.role,JSON.stringify(t.permissions||{})])).rows[0]}static async updateStaffAccount(t,e){let a=Object.keys(e).map((t,e)=>`${t} = $${e+2}`).join(", "),r=[t,...Object.values(e)],s=`UPDATE staff_accounts SET ${a} WHERE id = $1 RETURNING *`;return(await i.query(s,r)).rows[0]}static async getExchangeRates(t,e=100){let a=`
      SELECT *
      FROM exchange_rates
      WHERE restaurant_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;return(await i.query(a,[t,e])).rows}static async updateExchangeRate(t,e,a,r="chainlink"){let s=`
      INSERT INTO exchange_rates (restaurant_id, currency_pair, rate, source)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;return(await i.query(s,[t,e,a,r])).rows[0]}static async getTransactionAuditLog(t,e=100){let a=`
      SELECT *
      FROM transaction_audit_log
      WHERE 1=1
    `,r=[];return t&&(r.push(t),a+=` AND restaurant_id = $${r.length}`),a+=` ORDER BY created_at DESC LIMIT $${r.length+1}`,r.push(e),(await i.query(a,r)).rows}static async addToAuditLog(t,e,a,r){let s=`
      INSERT INTO transaction_audit_log (restaurant_id, tx_hash, event_type, event_data, block_number)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;return(await i.query(s,[t,e,a,JSON.stringify(r||{}),0])).rows[0]}static async updateRestaurant(t,e){return null}static async getRestaurantById(t){return null}static async getChainByRestaurantId(t){return null}}r()}catch(t){r(t)}})}};var e=require("../../../../webpack-runtime.js");e.C(t);var a=t=>e(e.s=t),r=e.X(0,[276,972],()=>a(6277));module.exports=r})();