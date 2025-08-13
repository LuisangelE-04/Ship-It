import postgres from 'postgres';
import bcrypt from 'bcrypt';

import {
  users,
  userProfiles,
  courierProfiles,
  addresses,
  packages,
  orders,
  pricingRules,
  orderTracking
} from '../lib/placeholder-data';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Seed functions (schema assumed already created by /seed route)

async function seedUsers() {
  if (!users.length) return;
  await Promise.all(
    users.map(async (u) => {
      const hashed = u.password.startsWith('$2') ? u.password : await bcrypt.hash(u.password, 10);
      await sql`
        INSERT INTO users (id, email, password, role, is_active)
        VALUES (${u.id}, ${u.email}, ${hashed}, ${u.role}, ${u.is_active})
        ON CONFLICT (id) DO NOTHING;
      `;
    })
  );
}

async function seedUserProfiles() {
  if (!userProfiles.length) return;
  await Promise.all(
    userProfiles.map(p => sql`
      INSERT INTO user_profiles (user_id, first_name, last_name, phone, avatar_url)
      VALUES (${p.user_id}, ${p.first_name}, ${p.last_name}, ${p.phone}, ${p.avatar_url})
      ON CONFLICT (user_id) DO NOTHING;
    `)
  );
}

async function seedCourierProfiles() {
  if (!courierProfiles.length) return;
  await Promise.all(
    courierProfiles.map(c => sql`
      INSERT INTO courier_profiles (user_id, vehicle_type, license_plate, rating, total_deliveries, is_available)
      VALUES (${c.user_id}, ${c.vehicle_type}, ${c.license_plate}, ${c.rating}, ${c.total_deliveries}, ${c.is_available})
      ON CONFLICT (user_id) DO NOTHING;
    `)
  );
}

async function seedAddresses() {
  if (!addresses.length) return;
  await Promise.all(
    addresses.map(a => sql`
      INSERT INTO addresses (id, street, city, state, zip_code, country, latitude, longitude)
      VALUES (${a.id}, ${a.street}, ${a.city}, ${a.state}, ${a.zip_code}, ${a.country}, ${a.latitude}, ${a.longitude})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedPackages() {
  if (!packages.length) return;
  await Promise.all(
    packages.map(p => sql`
      INSERT INTO packages (id, type, weight_kg, dimensions, is_fragile, special_instructions, declared_value)
      VALUES (${p.id}, ${p.type}, ${p.weight_kg}, ${p.dimensions}, ${p.is_fragile}, ${p.special_instructions}, ${p.declared_value})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedPricingRules() {
  if (!pricingRules.length) return;
  // No id supplied in placeholder data; this will insert duplicates if re-run.
  await Promise.all(
    pricingRules.map(r => sql`
      INSERT INTO pricing_rules (package_type, base_price, price_per_km, price_per_kg, priority_multiplier, is_active)
      VALUES (${r.package_type}, ${r.base_price}, ${r.price_per_km}, ${r.price_per_kg}, ${r.priority_multiplier}, ${r.is_active})
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedOrders() {
  if (!orders.length) return;
  await Promise.all(
    orders.map((o) => sql`
      INSERT INTO orders (
        id, order_number, status, priority, customer_id, courier_id,
        pickup_address_id, delivery_address_id, package_id,
        requested_pickup_date, actual_pickup_date, estimated_delivery_date, actual_delivery_date,
        estimated_price, final_price
      )
      VALUES (
        ${o.id}, ${o.order_number}, ${o.status}, ${o.priority}, ${o.customer_id}, ${o.courier_id ?? null},
        ${o.pickup_address_id}, ${o.delivery_address_id}, ${o.package_id},
        ${o.requested_pickup_date}, ${o.actual_pickup_date ?? null}, ${o.estimated_delivery_date ?? null}, ${o.actual_delivery_date ?? null},
        ${o.estimated_price ?? null}, ${o.final_price ?? null}
      )
      ON CONFLICT (id) DO NOTHING;
    `)
  );
}

async function seedOrderTracking() {
  if (!orderTracking.length) return;
  await Promise.all(
    orderTracking.map(t => sql`
      INSERT INTO order_tracking (order_id, status, message, latitude, longitude, updated_by, timestamp)
      VALUES (${t.order_id}, ${t.status}, ${t.message ?? null}, ${t.latitude ?? null}, ${t.longitude ??null}, ${t.updated_by}, ${t.timestamp})
      ON CONFLICT DO NOTHING;
    `)
  );
}

export async function GET() {
  try {
    await sql.begin(async () => {
      await seedUsers();
      await seedUserProfiles();
      await seedCourierProfiles();
      await seedAddresses();
      await seedPackages();
      await seedPricingRules();
      await seedOrders();
      await seedOrderTracking();
    });

    return Response.json({
      message: 'Placeholder data seeded successfully'
    });
  } catch (error) {
    console.error('Populate failed', error);
    return Response.json(
      { error: 'Populate failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}