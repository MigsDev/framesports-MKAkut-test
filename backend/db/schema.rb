# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_21_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "clip_comments", force: :cascade do |t|
    t.bigint "clip_id", null: false
    t.string "author", limit: 80, null: false
    t.text "body", null: false
    t.integer "rating"
    t.string "kind", default: "comment", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["clip_id", "created_at"], name: "index_clip_comments_on_clip_id_and_created_at"
    t.index ["clip_id"], name: "index_clip_comments_on_clip_id"
    t.check_constraint "rating IS NULL OR (rating >= 1 AND rating <= 5)", name: "clip_comments_rating_range"
  end

  create_table "clips", force: :cascade do |t|
    t.string "title", null: false
    t.string "sport", null: false
    t.string "status", default: "draft", null: false
    t.integer "views", default: 0, null: false
    t.integer "duration_seconds", default: 60, null: false
    t.text "video_url"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["sport"], name: "index_clips_on_sport"
    t.index ["status"], name: "index_clips_on_status"
    t.check_constraint "duration_seconds > 0", name: "clips_duration_positive"
    t.check_constraint "views >= 0", name: "clips_views_nonnegative"
  end
  add_foreign_key "clip_comments", "clips"
end
