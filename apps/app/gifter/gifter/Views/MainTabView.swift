//
//  MainTabView.swift
//  gifter
//
//  Main Tab Bar Navigation
//

import SwiftUI

struct MainTabView: View {
    @State private var selectedTab = 0

    init() {
        // Configure tab bar appearance
        let appearance = UITabBarAppearance()
        appearance.configureWithOpaqueBackground()
        appearance.backgroundColor = UIColor(GifterColors.gifterBlack)

        // Configure item appearance
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor(GifterColors.gifterGray)
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            .foregroundColor: UIColor(GifterColors.gifterGray)
        ]

        appearance.stackedLayoutAppearance.selected.iconColor = UIColor(GifterColors.gifterWhite)
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            .foregroundColor: UIColor(GifterColors.gifterWhite)
        ]

        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
    }

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack {
                HomeView(selectedTab: $selectedTab)
            }
            .tabItem {
                Label("Home", systemImage: "house")
            }
            .tag(0)

            NavigationStack {
                FindView()
            }
            .tabItem {
                Label("Find", systemImage: "sparkles")
            }
            .tag(1)

            NavigationStack {
                OccasionsView()
            }
            .tabItem {
                Label("Occasions", systemImage: "calendar")
            }
            .tag(2)

            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Label("You", systemImage: "person.circle")
            }
            .tag(3)
        }
        .accentColor(GifterColors.gifterWhite)
    }
}
