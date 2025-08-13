export type UserRole = 'CUSTOMER' | 'COURIER' | 'ADMIN' | 'SUPPORT';
export type OrderStatus = 
  | 'PENDING'
  | 'ACCEPTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'FAILED_DELIVERY';
export type PackageType =
  | 'ENVELOPE'
  | 'SMALL_PACKAGE'
  | 'MEDIUM_PACKAGE'
  | 'LARGE_PACKAGE'
  | 'FRAGILE'
  | 'FOOD_DELIVERY'
  | 'DOCUMENTS';
export type PriorityLevel = 'STANDARD' | 'EXPRESS' | 'URGENT' | 'SAME_DAY';

export interface WithTimestamps {
  created_at: Date;
  updated_at?: Date;
}

export type UUID = string;

export interface User extends WithTimestamps {
  id: UUID;
  email: string;
  password: string;
  role: UserRole;
  is_active: boolean;
}

export interface UserProfile {
  id: UUID;
  user_id: UUID;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  created_at: Date;
}

export interface CourierProfile {
  id: UUID;
  user_id: UUID;
  vehicle_type: string;
  license_plate: string;
  rating: number;
  total_deliveries: number;
  is_available: boolean;
  created_at: Date;
}

export interface Address {
  id: UUID;
  street: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  latitude: number | null;
  longitude: number | null;
  created_at: Date;
}

export interface Package {
  id: UUID;
  type: PackageType;
  weight_kg: number | null;
  dimensions: string | null;
  is_fragile: boolean;
  special_instructions: string | null;
  declared_value: number | null;
  created_at: Date;
}

export interface Order extends WithTimestamps {
  id: UUID;
  order_number: string;
  status: OrderStatus;
  priority: PriorityLevel;
  customer_id: UUID;
  courier_id: UUID | null;
  pickup_address_id: UUID;
  delivery_address_id: UUID;
  package_id: UUID;
  requested_pickup_date: Date;
  actual_pickup_date: Date | null;
  estimated_delivery_date: Date | null;
  actual_delivery_date: Date | null;
  estimated_price: number | null;
  final_price: number | null;
}

export interface PricingRule extends WithTimestamps {
  id: UUID;
  package_type: PackageType;
  base_price: number;
  price_per_km: number;
  price_per_kg: number | null;
  priority_multiplier: number;
  is_active: boolean;
}

export interface OrderTracking {
  id: UUID;
  order_id: UUID;
  status: OrderStatus;
  message: string | null;
  latitude: number | null;
  longitude: number | null;
  updated_by: UUID;
  timestamp: Date;
}

export type NewUser = Omit<User, 'id' | 'created_at' | 'updated_at'> & { id?: UUID };
export type NewUserProfile = Omit<UserProfile, 'id' | 'created_at'> & { id?: UUID };
export type NewCourierProfile = Omit<CourierProfile, 'id' | 'created_at'> & { id?: UUID };
export type NewAddress = Omit<Address, 'id' | 'created_at'> & { id?: UUID };
export type NewPackage = Omit<Package, 'id' | 'created_at'> & { id?: UUID };
export type NewOrder = Omit<Order, 'id' | 'created_at' | 'updated_at'> & { id?: UUID };
export type NewPricingRule = Omit<PricingRule, 'id' | 'created_at' | 'updated_at'> & { id?: UUID };
export type NewOrderTracking = Omit<OrderTracking, 'id' | 'timestamp'> & { id?: UUID; timestamp?: Date };

export interface OrderWithRelations extends Order {
  package?: Package;
  customer?: User;
  courier?: User | null;
  pickup_address?: Address;
  delivery_address?: Address;
  tracking?: OrderTracking[];
}

export interface CourierWithProfile extends User {
  courier_profile?: CourierProfile | null;
  user_profile?: UserProfile | null;
}

export interface UserWithProfile extends User {
  user_profile?: UserProfile | null;
}

export function isCourier(user: User): boolean {
  return user.role === 'COURIER';
}

export function isAdmin(user: User): boolean {
  return user.role === 'ADMIN';
}

export function isSupport(user: User): boolean {
  return user.role === 'SUPPORT';
}