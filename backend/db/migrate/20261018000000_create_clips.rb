class CreateClips < ActiveRecord::Migration[8.0]
  def change
    create_table :clips do |t|
      t.string :title, null: false
      t.string :sport, null: false
      t.string :status, null: false, default: "draft"
      t.integer :views, null: false, default: 0
      t.integer :duration_seconds, null: false, default: 60
      t.text :video_url
      t.timestamps
    end

    add_index :clips, :sport
    add_index :clips, :status
    add_check_constraint :clips, "views >= 0", name: "clips_views_nonnegative"
    add_check_constraint :clips, "duration_seconds > 0", name: "clips_duration_positive"
  end
end
