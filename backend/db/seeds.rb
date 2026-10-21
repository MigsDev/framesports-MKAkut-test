examples = [
  ["Final-minute comeback", "Football", "published", 16824, 87],
  ["Three-pointer compilation", "Basketball", "published", 9250, 112],
  ["Grand slam highlight", "Tennis", "reviewing", 420, 64],
  ["Overtime winner", "Hockey", "published", 7510, 48],
  ["Sprint finish analysis", "Athletics", "draft", 0, 76],
  ["Defensive masterclass", "Football", "reviewing", 1830, 94]
]

examples.each do |title, sport, status, views, duration|
  # Only create missing demo records. Updating an existing record here would
  # overwrite real view counts and manual edits on every Docker restart.
  Clip.find_or_create_by!(title: title) do |clip|
    clip.sport = sport
    clip.status = status
    clip.views = views
    clip.duration_seconds = duration
  end
end
