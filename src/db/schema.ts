import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  password: text('password').notNull(),
  role: text('role').notNull().default('user'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: text('event_date').notNull(),
  location: text('location'),
  maxAttendees: integer('max_attendees'),
  organizerId: integer('organizer_id').references(() => users.id),
  status: text('status').notNull().default('published'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const registrations = sqliteTable('registrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: integer('event_id').references(() => events.id),
  userId: integer('user_id').references(() => users.id),
  registrationDate: text('registration_date').notNull(),
  status: text('status').notNull().default('registered'),
  createdAt: text('created_at').notNull(),
});

export const attendance = sqliteTable('attendance', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  registrationId: integer('registration_id').references(() => registrations.id),
  isPresent: integer('is_present', { mode: 'boolean' }).default(false),
  markedAt: text('marked_at'),
  markedBy: integer('marked_by').references(() => users.id),
  notes: text('notes'),
});