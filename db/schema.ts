import { sqliteTable, text, integer, primaryKey } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ۱. جدول دسته‌بندی‌ها
export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color').notNull(),
  icon: text('icon').notNull(),
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ۲. جدول برچسب‌ها (Tags)
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ۳. جدول اصلی تسک‌ها
export const tasks = sqliteTable('tasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: integer('due_date'),
  priority: text('priority').notNull(), // 'high' | 'medium' | 'low'
  status: text('status').notNull().default('pending'), // 'pending' | 'in_progress' | 'completed' | 'archived' | 'trashed'
  categoryId: text('category_id').references(() => categories.id),
  reminderTime: integer('reminder_time'),
  recurrence: text('recurrence'), // 'none', 'daily', 'weekly', 'monthly', 'custom'
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  trashedAt: integer('trashed_at'),
});

// ۴. جدول زیرتسک‌ها (Checklist)
export const subtasks = sqliteTable('subtasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  taskId: text('task_id').references(() => tasks.id).notNull(),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ۵. جدول واسط برای ارتباط چندبه‌چند (تسک و برچسب)
export const tasksToTags = sqliteTable('tasks_to_tags', {
  taskId: text('task_id').references(() => tasks.id).notNull(),
  tagId: text('tag_id').references(() => tags.id).notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.taskId, t.tagId] }),
}));

// ۶. جدول پوشه‌های یادداشت
export const noteFolders = sqliteTable('note_folders', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

// ۷. جدول یادداشت‌ها (ویرایش شده جهت اتصال به پوشه)
export const notes = sqliteTable('notes', {
  id: text('id').primaryKey(),
  folderId: text('folder_id').references(() => noteFolders.id).notNull(),
  title: text('title').notNull(),
  content: text('content'),
  color: text('color'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  trashedAt: integer('trashed_at'),
});

// ۸. جدول جلسات تمرکز (Pomodoro)
export const focusSessions = sqliteTable('focus_sessions', {
  id: text('id').primaryKey(),
  duration: integer('duration').notNull(),
  completedAt: integer('completed_at').notNull(),
});

// ==========================================
// تعریف روابط (Relations) برای کوئری‌های راحت‌تر
// ==========================================

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  subtasks: many(subtasks),
  tags: many(tasksToTags),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  tasks: many(tasksToTags),
}));

export const tasksToTagsRelations = relations(tasksToTags, ({ one }) => ({
  task: one(tasks, {
    fields: [tasksToTags.taskId],
    references: [tasks.id],
  }),
  tag: one(tags, {
    fields: [tasksToTags.tagId],
    references: [tags.id],
  }),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));

export const noteFoldersRelations = relations(noteFolders, ({ many }) => ({
  notes: many(notes),
}));

export const notesRelations = relations(notes, ({ one }) => ({
  folder: one(noteFolders, {
    fields: [notes.folderId],
    references: [noteFolders.id],
  }),
}));