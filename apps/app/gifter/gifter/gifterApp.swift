//
//  gifterApp.swift
//  gifter
//
//  Created by Luca Jeevanjee on 16/12/2025.
//

import SwiftUI

@main
struct gifterApp: App {
    @StateObject private var appState = AppState()
    @StateObject private var wishlistViewModel = WishlistViewModel.shared

    var body: some Scene {
        WindowGroup {
            AppView()
                .environmentObject(appState)
                .environmentObject(wishlistViewModel)
        }
    }
}
