class Clip < ApplicationRecord
  has_many :clip_comments, dependent: :destroy

  STATUSES = %w[draft reviewing published].freeze

  validates :title, presence: true, length: { maximum: 120 }
  validates :sport, presence: true, length: { maximum: 50 }
  validates :status, inclusion: { in: STATUSES }
  validates :views, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :duration_seconds, numericality: { only_integer: true, greater_than: 0 }
  validates :video_url, format: { with: %r{\Ahttps?://\S+\z}i, message: "must be an HTTP(S) URL" }, allow_blank: true

  scope :recent_first, -> { order(created_at: :desc, id: :desc) }
  scope :search_title, ->(query) { where("title ILIKE ?", "%#{sanitize_sql_like(query)}%") }
end
