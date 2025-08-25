'use server';

import postgres from 'postgres';
import { z } from 'zod';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  zipCode: z.string().min(1),
  latitude: z.coerce.number().optional().nullable(),
  longitude: z.coerce.number().optional().nullable(),
});

const CreateAddress = addressSchema;

export async function createAddress(formData: FormData) {
  const validateFields = CreateAddress.safeParse({
    street: formData.get('street'),
    city: formData.get('city'),
    state: formData.get('state'),
    zipCode: formData.get('zipCode'),
    latitude: formData.get('latitude'),
    longitude: formData.get('longitude'),
  });

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Add Address,',
    };
  }

  const { street, city, state, zipCode, latitude, longitude } = validateFields.data;

  const [address] = await sql `
    INSERT INTO addresses (street, city, state, zip_code, latitude, longitude)
    VALUES (${street}, ${city}, ${state}, ${zipCode}, ${latitude ?? null}, ${longitude ?? null})
    RETURNING id
  `;

  return { success: true, addressId: address.id };
}

const packageSchema = z.object({
  type: z.enum([
    'ENVELOPE',
    'SMALL_PACKAGE',
    'MEDIUM_PACKAGE',
    'LARGE_PACKAGE',
    'FRAGILE',
    'FOOD_DELIVERY',
    'DOCUMENTS',
  ]),
  weight_kg: z.coerce.number().positive(),
  dimensions: z.string().max(50).optional(),
  is_fragile: z.coerce.boolean().optional().default(false),
  special_instructions: z.string().optional(),
  declared_value: z.coerce.number().min(0).optional().default(0),
});



const orderSchema = z.object({
  // Foreign keys
  pickup_address_id: z.uuid(),
  delivery_address_id: z.uuid(),
  package_id: z.uuid(),

  // Order fields
  priority: z.enum([
    'STANDARD', 
    'EXPRESS', 
    'URGENT', 
    'SAME_DAY'
  ]),
  status: z.string().min(1).default('PENDING'),
  courier_id: z.uuid().optional(),
  actual_pickup_date: z.string().optional(),
  estimated_delivery_date: z.string().optional(),
  actual_delivery_date: z.string().optional(),
  estimated_price: z.coerce.number().nonnegative(),
  final_price: z.coerce.number().nonnegative().optional(),
});

/*
export async function createShipment(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());

  const result = shipmentSchema.safeParse(raw);
  if (!result.success) {
    return {
      error: result.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice',
    };
  }

  const { 
    pickupStreet, pickupCity, pickupState, pickupZipCode, pickupLat, pickupLong, 
    deliveryStreet, deliveryCity, deliveryState, deliveryZipCode, deliveryLat, deliveryLong,
    packageType, weightKg, dimensions, isFragile, specialInstructions, 
    declaredValue, priority, requestedPickupDate
  } = result.data;

  const [pickup] = await sql `
    INSERT INTO addresses (street, city, state, zip_code, country, latitude, longitude)
    VALUES (${pickupStreet}, ${pickupCity}, ${pickupState}, ${pickupZipCode}, 'USA', ${pickupLat ?? null}, ${pickupLong ?? null})
    RETURNING id
  `;

  const [delivery] = await sql `
    INSERT INTO addresses (street, city, state, zip_code, country, latitude, longitude)
    VALUES (${deliveryStreet}, ${deliveryCity}, ${deliveryState}, ${deliveryZipCode}, 'USA', ${pickupLat ?? null}, ${pickupLong ?? null})
    RETURNING id
  `;

  const [order] = await sql `
    INSERT INTO orders (
      pickup_address_id, delivery_address_id,
      package_type, weight_kg, dimensions, is_fragile, special_instructions, declared_value,
      priority, requested_pickup_date, status
    ) 
    VALUES (
      ${pickup.id}, ${delivery.id},
      ${packageType}, ${weightKg}, ${dimensions ?? null}, ${isFragile ?? null},
      ${specialInstructions ?? null}, ${declaredValue ?? null},
      ${priority}, ${requestedPickupDate}, 'PENDING'
    )
    RETURNING id, order_number
  `;

  return { success: true, orderId: order.id, orderNumber: order.order_number };
}*/