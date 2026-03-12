/**
 * standalone seed script
 * Run: npx ts-node -r tsconfig-paths/register src/database/seeds/seeder.ts
 */
import 'dotenv/config';
import * as mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';

// -- Inline minimal schemas (avoids NestJS DI) ---------------------------------
const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, lowercase: true },
    passwordHash: String,
    role: { type: String, default: 'customer' },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    phone: { type: String, default: '' },
  },
  { timestamps: true },
);

const CategorySchema = new mongoose.Schema(
  {
    name: String,
    slug: { type: String, unique: true, lowercase: true },
    icon: { type: String, default: '' },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    parent: { type: mongoose.Types.ObjectId, ref: 'Category', default: null },
    ancestors: [{ type: mongoose.Types.ObjectId, ref: 'Category' }],
    level: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    productCount: { type: Number, default: 0 },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    commissionRate: { type: Number, default: 10 },
  },
  { timestamps: true },
);

// -- Root categories ------------------------------------------------------------
const ROOT_CATEGORIES = [
  { name: 'Electronics',       slug: 'electronics',        icon: '??', order: 1, commissionRate: 8 },
  { name: 'Fashion & Clothing', slug: 'fashion-clothing',  icon: '??', order: 2, commissionRate: 12 },
  { name: 'Home & Living',      slug: 'home-living',       icon: '??', order: 3, commissionRate: 10 },
  { name: 'Books & Stationery', slug: 'books-stationery',  icon: '??', order: 4, commissionRate: 7 },
  { name: 'Sports & Outdoors',  slug: 'sports-outdoors',   icon: '?', order: 5, commissionRate: 10 },
  { name: 'Beauty & Health',    slug: 'beauty-health',     icon: '??', order: 6, commissionRate: 12 },
  { name: 'Grocery & Food',     slug: 'grocery-food',      icon: '??', order: 7, commissionRate: 6 },
  { name: 'Baby & Kids',        slug: 'baby-kids',         icon: '??', order: 8, commissionRate: 10 },
  { name: 'Automotive',         slug: 'automotive',        icon: '??', order: 9, commissionRate: 8 },
  { name: 'Others',             slug: 'others',            icon: '??', order: 10, commissionRate: 10 },
];

async function seed(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI env var is not set');

  console.log('??  Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('?  Connected');

  const UserModel    = mongoose.model('User', UserSchema);
  const CategoryModel = mongoose.model('Category', CategorySchema);

  // -- Super Admin --------------------------------------------------------------
  const adminEmail    = process.env.SUPER_ADMIN_EMAIL;
  const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set');
  }

  const existing = await UserModel.findOne({ email: adminEmail.toLowerCase() });
  if (existing) {
    console.log(`??   Super admin already exists (${adminEmail})`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await UserModel.create({
      name: 'Super Admin',
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`?  Super admin created (${adminEmail})`);
  }

  // -- Root Categories -----------------------------------------------------------
  let catCreated = 0;
  let catSkipped = 0;
  for (const cat of ROOT_CATEGORIES) {
    const exists = await CategoryModel.findOne({ slug: cat.slug });
    if (exists) {
      catSkipped++;
    } else {
      await CategoryModel.create({ ...cat, parent: null, ancestors: [], level: 0 });
      catCreated++;
    }
  }
  console.log(`?  Categories: ${catCreated} created, ${catSkipped} already existed`);

  await mongoose.disconnect();
  console.log('??  Seeding complete');
}

seed().catch((err: Error) => {
  console.error('?  Seeding failed:', err.message);
  process.exit(1);
});
