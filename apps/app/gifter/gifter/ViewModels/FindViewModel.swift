//
//  FindViewModel.swift
//  gifter
//
//  Created by Luca Jeevanjee on 02/01/2026.
//

import Foundation
import SwiftUI

@MainActor
final class FindViewModel: ObservableObject {
    @Published var searchText: String?
    @Published var recentGiftingProfiles: [GiftingProfile] = []
    
    
}
