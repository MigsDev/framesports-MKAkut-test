class CreateClipComments < ActiveRecord::Migration[8.1]
  def change
    create_table :clip_comments do |t|
      t.references :clip, null: false, foreign_key: true, index: true
      t.string :author, null: false, limit: 80
      t.text :body, null: false
      t.integer :rating
      t.string :kind, default: "comment", null: false
      t.timestamps
    end
    add_index :clip_comments, [:clip_id, :created_at]
    add_check_constraint :clip_comments, "rating IS NULL OR rating BETWEEN 1 AND 5", name: "clip_comments_rating_range"
  end
end
