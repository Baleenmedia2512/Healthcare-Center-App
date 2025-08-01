# 🔧 MariaDB/MySQL Configuration Instructions

## Step 1: Update your .env file
Replace the placeholder values in your .env file with your actual database credentials:

```env
DB_HOST=your-actual-server-host
DB_USER=your-actual-username  
DB_PASS=your-actual-password
DB_NAME=your-actual-database-name
```

## Step 2: Test Connection
After updating your credentials, run:
```bash
npm run db:push
```

## Step 3: Seed Database
If the connection works, run:
```bash  
npm run db:seed
```

## Step 4: Import Old Data (Optional)
If you want to keep your existing data, we have exported it to data-export.json
You can create a custom import script if needed.

## Troubleshooting

### Connection Issues
- Ensure your MariaDB server is running
- Check firewall settings
- Verify the port (default 3306)
- Test connection with MySQL client first

### SSL Issues
If you get SSL errors, you can add to your DATABASE_URL:
```
?sslaccept=strict
```
or disable SSL:
```
?ssl={"rejectUnauthorized":false}
```

### Port Issues
If using a non-standard port, update the DATABASE_URL:
```
mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:YOUR_PORT/${DB_NAME}
```
