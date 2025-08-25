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
  weightKg: z.coerce.number().positive(),
  dimensions: z.string().max(50).optional(),
  isFragile: z.coerce.boolean().optional().default(false),
  specialInstructions: z.string().optional().nullable(),
  declaredValue: z.coerce.number().min(0).optional().default(0),
});

const CreatePackage = packageSchema;

export async function createPackage(formData: FormData) {
  const validateFields = CreatePackage.safeParse({
    type: formData.get('type'),
    weightKg: formData.get('weightKg'),
    dimensions: formData.get('dimensions'),
    isFragile: formData.get('isFragile'),
    specialInstructions: formData.get('specialInstructions'),
    declaredValue: formData.get('declaredValue'),
  });

  if (!validateFields.success) {
    return {
      errors: validateFields.error.flatten().fieldErrors,
      messsage: 'Missing Fields, Failed to Add Package',
    };
  }

  const { type, weightKg, dimensions, isFragile, specialInstructions, declaredValue } = validateFields.data;

  const [createdPackage] = await sql `
    INSERT INTO packages (type, weight_kg, dimensions, is_fragile, special_instructions, declared_value)
    VALUES (${type}, ${weightKg}, ${dimensions ?? null}, ${isFragile}, ${specialInstructions ?? null}, ${declaredValue})
    RETURNING id
  `;

  return { success: true, packageId: createdPackage.id };
}

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
