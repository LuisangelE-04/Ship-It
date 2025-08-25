import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

interface PostgresError extends Error {
  code?: string;
}

async function createUserRoleEnum() {
  try {
    await sql`
      CREATE TYPE user_role
      AS
      ENUM('CUSTOMER', 'COURIER', 'ADMIN', 'SUPPORT');
    `;
    
    console.log('user_role enum created');
  } catch(error) {
    const pgError = error as PostgresError;
    if (pgError.code !== '42710') {
      throw error;
    }
    console.log('user_role enum already exists');
  }
}

async function createOrderStatusEnum() {
  try {
    await sql`
      CREATE TYPE order_status
      AS
      ENUM ('PENDING', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED_DELIVERY');
    `;

    console.log('order_status enum created');
  } catch(error) {
    const pgError = error as PostgresError;
    if (pgError.code !== '42710') {
      throw error;
    }
    console.log('order_status enum already exists');
  }
}

async function createPackageTypeEnum() {
  try {
    await sql`
      CREATE TYPE package_type
      AS
      ENUM ('ENVELOPE', 'SMALL_PACKAGE', 'MEDIUM_PACKAGE', 'LARGE_PACKAGE', 'FRAGILE', 'FOOD_DELIVERY', 'DOCUMENTS');
    `;
    console.log('package_type enum created');
  } catch(error) {
    const pgError = error as PostgresError;
    if (pgError.code !== '42710') {
      throw error;
    }
    console.log('package_type enum already exists');
  }
}

async function createPriorityLevelEnum() {
  try {
    await sql`
      CREATE TYPE priority_level 
      AS 
      ENUM ('STANDARD', 'EXPRESS', 'URGENT', 'SAME_DAY');
    `;
    console.log('priority_level enum created');
  } catch(error) {
    const pgError = error as PostgresError;
    if (pgError.code !== '42710') {
      throw error;
    }
    console.log('priority_level enum already exists');
  }
}

async function createUsersTable() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role user_role DEFAULT 'CUSTOMER',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('users table created');
  } catch(error) {
    console.error('Failed to create users table:', error);
    throw error;
  }
}

async function createUserProfilesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      avatar_url VARCHAR(500),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    `;
}

async function createCourierProfilesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS courier_profiles (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      vehicle_type VARCHAR(50) NOT NULL,
      license_plate VARCHAR(20) UNIQUE NOT NULL,
      rating DECIMAL(3,2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
      total_deliveries INTEGER DEFAULT 0,
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function createAddressesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS addresses (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      street VARCHAR(255) NOT NULL,
      city VARCHAR(100) NOT NULL,
      state VARCHAR(50) NOT NULL,
      zip_code VARCHAR(10) NOT NULL,
      country VARCHAR(50) DEFAULT 'USA',
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function createPackagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS packages (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      type package_type NOT NULL,
      weight_kg DECIMAL(8,2) CHECK (weight_kg > 0),
      dimensions VARCHAR(50),
      is_fragile BOOLEAN DEFAULT FALSE,
      special_instructions TEXT,
      declared_value DECIMAL(10,2) CHECK (declared_value >= 0),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function createOrdersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      status order_status DEFAULT 'PENDING',
      priority priority_level DEFAULT 'STANDARD',
      
      customer_id UUID NOT NULL REFERENCES users(id),
      courier_id UUID REFERENCES users(id),
      pickup_address_id UUID NOT NULL REFERENCES addresses(id),
      delivery_address_id UUID NOT NULL REFERENCES addresses(id),
      package_id UUID UNIQUE NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
      
      actual_pickup_date TIMESTAMP WITH TIME ZONE,
      estimated_delivery_date TIMESTAMP WITH TIME ZONE,
      actual_delivery_date TIMESTAMP WITH TIME ZONE,
      
      estimated_price DECIMAL(10,2),
      final_price DECIMAL(10,2),
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      
      CHECK (estimated_price >= 0 AND final_price >= 0)
    );
  `;
}

async function createPricingRulesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS pricing_rules (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      package_type package_type NOT NULL,
      base_price DECIMAL(10,2) NOT NULL CHECK (base_price >= 0),
      price_per_km DECIMAL(10,4) NOT NULL CHECK (price_per_km >= 0),
      price_per_kg DECIMAL(10,4) CHECK (price_per_kg >= 0),
      priority_multiplier DECIMAL(3,2) DEFAULT 1.00 CHECK (priority_multiplier > 0),
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function createOrderTrackingTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS order_tracking (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      status order_status NOT NULL,
      message TEXT,
      latitude DECIMAL(10, 8),
      longitude DECIMAL(11, 8),
      updated_by UUID NOT NULL REFERENCES users(id),
      timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

async function createIndexes() {
  await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`
  await sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);`
  
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_courier_id ON orders(courier_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);`
  await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);`
  
  await sql`CREATE INDEX IF NOT EXISTS idx_addresses_lat_lng ON addresses(latitude, longitude);`
  await sql`CREATE INDEX IF NOT EXISTS idx_addresses_city_state ON addresses(city, state);`
  
  await sql`CREATE INDEX IF NOT EXISTS idx_order_tracking_order_id ON order_tracking(order_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_courier_profiles_available ON courier_profiles(is_available);`
}

export async function GET() {
  try {
    console.log('Starting database seeding...\n');

    await createUserRoleEnum();
    await createOrderStatusEnum();
    await createPackageTypeEnum();
    await createPriorityLevelEnum();

    await createUsersTable();
    await createUserProfilesTable();
    await createCourierProfilesTable()
    await createAddressesTable();
    await createPackagesTable();
    await createOrdersTable();
    await createPricingRulesTable();
    await createOrderTrackingTable();
    await createIndexes();

    return Response.json({ message: 'Database seeded successfully'});
  } catch (error) {
    return Response.json({ error, message: 'Failed to seed database' }, { status: 500 });
  }
}
