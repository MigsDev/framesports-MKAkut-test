Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.force_ssl = false # Enable behind a configured HTTPS reverse proxy for deployment.
  config.log_level = :info
  config.active_storage.service = :local
  config.secret_key_base = ENV.fetch("SECRET_KEY_BASE")
end
