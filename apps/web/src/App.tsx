import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import HomePage from "./features/home/HomePage";
import MarketsPage from "./features/markets/MarketsPage";
import TradePage from "./features/trade/TradePage";
import WalletPage from "./features/wallet/WalletPage";
import PortfolioPage from "./features/portfolio/PortfolioPage";
import StakingPage from "./features/staking/StakingPage";
import EarnPage from "./features/earn/EarnPage";
import SwapPage from "./features/swap/SwapPage";
import AlertsPage from "./features/alerts/AlertsPage";
import LaunchpadPage from "./features/launchpad/LaunchpadPage";
import ReferralPage from "./features/referral/ReferralPage";
import DeveloperPage from "./features/developer/DeveloperPage";
import AdminPage from "./features/admin/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/markets" element={<MarketsPage />} />
        <Route path="/trade/:symbol" element={<TradePage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/staking" element={<StakingPage />} />
        <Route path="/earn" element={<EarnPage />} />
        <Route path="/swap" element={<SwapPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/launchpad" element={<LaunchpadPage />} />
        <Route path="/referral" element={<ReferralPage />} />
        <Route path="/developer" element={<DeveloperPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
