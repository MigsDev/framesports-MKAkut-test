require "test_helper"

class ClipTest < ActiveSupport::TestCase
  test "rejects invalid video url" do
    clip = Clip.new(title: "Goal", sport: "Football", status: "draft", views: 0, duration_seconds: 20, video_url: "javascript:alert(1)")
    assert_not clip.valid?
    assert_includes clip.errors[:video_url].join, "HTTP(S)"
  end

  test "accepts valid record" do
    clip = Clip.new(title: "Goal", sport: "Football", status: "draft", views: 0, duration_seconds: 20)
    assert clip.valid?
  end
  test "seed data does not reset an existing video's recorded views" do
    clip = Clip.find_or_create_by!(title: "Final-minute comeback") do |record|
      record.sport = "Football"
      record.status = "published"
      record.duration_seconds = 87
    end
    clip.update!(views: 49210)

    load Rails.root.join("db/seeds.rb")

    assert_equal 49210, clip.reload.views
  end

end
