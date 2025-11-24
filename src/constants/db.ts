import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const DB_CONFIG: TypeOrmModuleOptions = {
  type: 'better-sqlite3',
  database: 'database.sqlite',
  synchronize: true,
  entities: [`./dist/**/*.entity{.ts,.js}`],
};

// export const DB_DEV_CONFIG: TypeOrmModuleOptions = {
//   type: 'better-sqlite3',
//   database: 'dev.sqlite',
//   synchronize: true,
//   entities: [`./dist/**/*.entity{.ts,.js}`],
// };

// export const DB_PROD_CONFIG: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: 'localhost',
//   username: env.POSTGRES_USER,
//   password: env.POSTGRES_PASSWORD,
//   database: env.POSTGRES_DB,
//   port: 5432,
//   synchronize: true,
//   entities: [`./dist/**/*.entity{.ts,.js}`],
// };
