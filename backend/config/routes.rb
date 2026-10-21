Rails.application.routes.draw do
  namespace :api do
    get "health", to: "health#show"
    get "dashboard", to: "dashboard#show"
    get "sports_feeds", to: "sports_feeds#index"
    post "clips/:id/view", to: "clips#register_view"
    resources :clips, only: %i[index show create update destroy] do
      resources :comments, only: %i[index create], controller: "clip_comments"
    end
  end
end
