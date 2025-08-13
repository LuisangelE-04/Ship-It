import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

export async function GET() {
  try {
    await sql.begin(async (sql) => {
      // Disable foreign key checks during truncate
      await sql`SET CONSTRAINTS ALL DEFERRED`;
      
      // Truncate all tables (order matters due to foreign keys)
      await sql`TRUNCATE TABLE 
        order_tracking,
        pricing_rules,
        orders,
        packages,
        addresses,
        courier_profiles,
        user_profiles,
        users
      CASCADE`;
    });
    
    return Response.json({ message: 'All data deleted successfully' });
  } catch (error) {
    console.error('Failed to reset database:', error);
    return Response.json({ 
      error: 'Failed to reset database',
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}