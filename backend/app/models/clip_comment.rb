class ClipComment < ApplicationRecord
  belongs_to :clip

  KINDS = %w[comment issue].freeze
  validates :author, presence: true, length: { maximum: 80 }
  validates :body, presence: true, length: { maximum: 2000 }
  validates :kind, inclusion: { in: KINDS }
  validates :rating, inclusion: { in: 1..5 }, allow_nil: true
end
