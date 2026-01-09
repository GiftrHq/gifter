//
//  HomeView.swift
//  gifter
//
//  Home Tab
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @StateObject private var viewModel = HomeViewModel()
    @Binding var selectedTab: Int

    @State private var showGreeting = false
    @State private var contentOffset: CGFloat = 0

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            if viewModel.isLoading && !viewModel.hasLoadedInitialData {
                // Initial loading state
                loadingView
            } else if let error = viewModel.error, viewModel.collections.isEmpty {
                // Error state (only if no cached data)
                errorView(error: error)
            } else {
                // Content
                contentView
            }
        }
        .task {
            if !viewModel.hasLoadedInitialData {
                await viewModel.loadData()
            }
        }
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .principal) {
                Image("logo")
                    .resizable()
                    .renderingMode(.template)
                    .foregroundColor(GifterColors.gifterWhite)
                    .frame(width: 24, height: 24)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.4).delay(0.1)) {
                showGreeting = true
            }
        }
    }

    private var contentView: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 40) {
                // Greeting Strip
                greetingStrip
                    .opacity(showGreeting ? 1 : 0)
                    .offset(y: showGreeting ? 0 : 10)

                // Curated Collections
                if !viewModel.collections.isEmpty {
                    collectionsSection
                }

                // Upcoming Occasions
                if !viewModel.upcomingOccasions.isEmpty {
                    occasionsSection
                }

                // Recommended for You
                if !viewModel.recommendedForYou.isEmpty {
                    recommendationsSection
                }

                // Find something for...
                findSomeoneCard

                Spacer(minLength: 100)
            }
            .padding(.top, 20)
            .background(
                GeometryReader { proxy in
                    Color.clear.preference(
                        key: ScrollOffsetPreferenceKey.self,
                        value: proxy.frame(in: .named("scroll")).minY
                    )
                }
            )
        }
        .coordinateSpace(name: "scroll")
        .onPreferenceChange(ScrollOffsetPreferenceKey.self) { value in
            contentOffset = -value
        }
        .refreshable {
            await viewModel.refresh()
        }
    }

    private var loadingView: some View {
        VStack(spacing: 20) {
            ProgressView()
                .tint(GifterColors.gifterWhite)
                .scaleEffect(1.2)

            Text("Curating your collections...")
                .gifterCaption()
                .foregroundColor(GifterColors.gifterGray)
        }
    }

    private func errorView(error: HomeViewModel.HomeError) -> some View {
        VStack(spacing: 20) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 48))
                .foregroundColor(GifterColors.gifterGray)

            Text(error.errorDescription ?? "Something went wrong")
                .gifterBody()
                .multilineTextAlignment(.center)

            Text(error.recoveryMessage)
                .gifterCaption()
                .foregroundColor(GifterColors.gifterGray)
                .multilineTextAlignment(.center)

            GifterButton(title: "Try Again", style: .secondary) {
                Task {
                    await viewModel.loadData()
                }
            }
            .padding(.top, 10)
        }
        .padding(.horizontal, 40)
    }

    private var greetingStrip: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(greeting)
                .gifterCaption()
                .textCase(.uppercase)

            Text("Here's what I've been quietly curating for you.")
                .gifterBody()
                .foregroundColor(GifterColors.gifterGray)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 24)
    }

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let timeOfDay = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"
        let name = appState.currentUser?.firstName ?? "there"
        return "Good \(timeOfDay), \(name)."
    }

    private var collectionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Curated for you")
                .gifterDisplayL()
                .padding(.horizontal, 24)

            CollectionCarouselView(collections: viewModel.collections)
        }
        .transition(.opacity.combined(with: .move(edge: .top)))
    }

    private var occasionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Coming up soon")
                .gifterDisplayL()
                .padding(.horizontal, 24)

            OccasionChipsView(occasions: viewModel.upcomingOccasions)

            Text("Tap an occasion and I'll start shortlisting gifts right away.")
                .gifterCaption()
                .padding(.horizontal, 24)
        }
        .transition(.opacity.combined(with: .move(edge: .top)))
    }

    private var recommendationsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("For your own wishlists")
                .gifterDisplayL()
                .padding(.horizontal, 24)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(viewModel.recommendedForYou) { product in
                        NavigationLink(destination: ProductDetailView(product: product, context: .user)) {
                            ProductCardView(product: product, showAIContext: true)
                        }
                    }
                }
                .padding(.horizontal, 24)
            }
        }
        .transition(.opacity.combined(with: .move(edge: .top)))
    }

    private var findSomeoneCard: some View {
        GifterCard(onTap: {
            selectedTab = 1 // Switch to Find tab
        }) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Find something for...")
                    .gifterBody()

                Text("A friend, a partner, your dad, or even someone who isn't on Gifter yet.")
                    .gifterCaption()
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.horizontal, 24)
    }
}

// MARK: - Scroll Offset Tracking
struct ScrollOffsetPreferenceKey: PreferenceKey {
    static var defaultValue: CGFloat = 0

    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}
