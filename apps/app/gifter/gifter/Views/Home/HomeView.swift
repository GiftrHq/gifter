//
//  HomeView.swift
//  gifter
//
//  Home Tab
//

import SwiftUI

struct HomeView: View {
    @EnvironmentObject var appState: AppState
    @Binding var selectedTab: Int

    @State private var showGreeting = false
    @State private var collections = MockData.collections
    @State private var occasions = MockData.occasions
    @State private var recommendations = MockData.products

    var body: some View {
        ZStack {
            GifterColors.gifterBlack
                .ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 40) {
                    // Greeting Strip
                    greetingStrip
                        .opacity(showGreeting ? 1 : 0)
                        .offset(y: showGreeting ? 0 : 10)

                    // Curated Collections
                    collectionsSection

                    // Upcoming Occasions
                    if !occasions.isEmpty {
                        occasionsSection
                    }

                    // Recommended for You
                    recommendationsSection

                    // Find something for...
                    findSomeoneCard

                    Spacer(minLength: 100)
                }
                .padding(.top, 20)
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

            CollectionCarouselView(collections: collections)
        }
    }

    private var occasionsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Coming up soon")
                .gifterDisplayL()
                .padding(.horizontal, 24)

            OccasionChipsView(occasions: occasions)

            Text("Tap an occasion and I'll start shortlisting gifts right away.")
                .gifterCaption()
                .padding(.horizontal, 24)
        }
    }

    private var recommendationsSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("For your own wishlists")
                .gifterDisplayL()
                .padding(.horizontal, 24)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 16) {
                    ForEach(recommendations) { product in
                        NavigationLink(destination: ProductDetailView(product: product, context: .user)) {
                            ProductCardView(product: product, showAIContext: true)
                        }
                    }
                }
                .padding(.horizontal, 24)
            }
        }
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
