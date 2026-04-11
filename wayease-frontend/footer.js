/**
 * Injects a consistent site footer into #wayease-footer-root (add before </body> on each page).
 */
(function () {
  const root = document.getElementById('wayease-footer-root');
  if (!root) return;

  const y = new Date().getFullYear();
  root.innerHTML = `
<footer class="wayease-footer bg-gray-900 text-gray-300 border-t border-gray-800">
  <div class="max-w-6xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm">
    <div>
      <p class="font-semibold text-white mb-3 tracking-tight">WayEase</p>
      <p class="text-gray-400 leading-relaxed">Plan trips, discover places, and keep a travel diary — built for explorers in India.</p>
    </div>
    <div>
      <p class="font-semibold text-white mb-3">Explore</p>
      <ul class="space-y-2">
        <li><a href="index.html" class="hover:text-primary transition">Home</a></li>
        <li><a href="bangalore.html" class="hover:text-primary transition">Bangalore</a></li>
        <li><a href="delhi.html" class="hover:text-primary transition">Delhi</a></li>
        <li><a href="mumbai.html" class="hover:text-primary transition">Mumbai</a></li>
        <li><a href="goa.html" class="hover:text-primary transition">Goa</a></li>
        <li><a href="hyderabad.html" class="hover:text-primary transition">Hyderabad</a></li>
      </ul>
    </div>
    <div>
      <p class="font-semibold text-white mb-3">Account</p>
      <ul class="space-y-2">
        <li><a href="login.html" class="hover:text-primary transition">Login</a></li>
        <li><a href="wishlist.html" class="hover:text-primary transition">Wishlist</a></li>
        <li><a href="itineraries.html" class="hover:text-primary transition">Itineraries</a></li>
        <li><a href="profile.html" class="hover:text-primary transition">Profile</a></li>
      </ul>
    </div>
    <div>
      <p class="font-semibold text-white mb-3">Support</p>
      <p class="text-gray-400">Demo app — reservations and OTP are simulated. Connect real SMS & OAuth in production.</p>
    </div>
  </div>
  <div class="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
    © ${y} WayEase · <a href="index.html" class="hover:text-primary">Privacy</a> · <a href="index.html" class="hover:text-primary">Terms</a>
  </div>
</footer>`;
})();
