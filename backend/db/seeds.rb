examples = [
  ["Final-minute comeback", "Football", "published", 16824, 87],
  ["Three-pointer compilation", "Basketball", "published", 9250, 112],
  ["Grand slam highlight", "Tennis", "reviewing", 420, 64],
  ["Overtime winner", "Hockey", "published", 7510, 48],
  ["Sprint finish analysis", "Athletics", "draft", 0, 76],
  ["Defensive masterclass", "Football", "reviewing", 1830, 94]
]

examples.each do |title, sport, status, views, duration|
  clip = Clip.find_or_initialize_by(title: title)
  clip.update!(sport: sport, status: status, views: views, duration_seconds: duration)
end
