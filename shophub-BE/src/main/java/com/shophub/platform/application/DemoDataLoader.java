package com.shophub.platform.application;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.shophub.catalog.domain.Category;
import com.shophub.catalog.domain.Product;
import com.shophub.catalog.domain.ProductVariantDef;
import com.shophub.catalog.infrastructure.CategoryRepository;
import com.shophub.catalog.infrastructure.ProductRepository;
import com.shophub.catalog.infrastructure.ProductVariantDefRepository;
import com.shophub.identity.domain.Address;
import com.shophub.identity.domain.User;
import com.shophub.identity.infrastructure.AddressRepository;
import com.shophub.identity.infrastructure.UserRepository;
import com.shophub.notification.domain.Notification;
import com.shophub.notification.infrastructure.NotificationRepository;
import com.shophub.payout.domain.SellerBalance;
import com.shophub.payout.infrastructure.SellerBalanceRepository;
import com.shophub.promotion.domain.Coupon;
import com.shophub.promotion.infrastructure.CouponRepository;
import com.shophub.shop.domain.SellerApplication;
import com.shophub.shop.domain.Shop;
import com.shophub.shop.infrastructure.SellerApplicationRepository;
import com.shophub.shop.infrastructure.ShopRepository;

@Component
public class DemoDataLoader implements CommandLineRunner {

    private final boolean enabled;
    private final UserRepository users;
    private final AddressRepository addresses;
    private final ShopRepository shops;
    private final SellerApplicationRepository applications;
    private final SellerBalanceRepository balances;
    private final CategoryRepository categories;
    private final ProductRepository products;
    private final ProductVariantDefRepository variants;
    private final CouponRepository coupons;
    private final NotificationRepository notifications;
    private final PasswordEncoder passwordEncoder;

    public DemoDataLoader(
            @Value("${shophub.demo.enabled:true}") boolean enabled,
            UserRepository users,
            AddressRepository addresses,
            ShopRepository shops,
            SellerApplicationRepository applications,
            SellerBalanceRepository balances,
            CategoryRepository categories,
            ProductRepository products,
            ProductVariantDefRepository variants,
            CouponRepository coupons,
            NotificationRepository notifications,
            PasswordEncoder passwordEncoder) {
        this.enabled = enabled;
        this.users = users;
        this.addresses = addresses;
        this.shops = shops;
        this.applications = applications;
        this.balances = balances;
        this.categories = categories;
        this.products = products;
        this.variants = variants;
        this.coupons = coupons;
        this.notifications = notifications;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || users.count() > 0) {
            return;
        }
        String hash = passwordEncoder.encode("demo1234");

        User buyer = user("Alex Morgan", "alex@shophub.com", hash, "buyer", null, "+1 (555) 999-0000");
        User seller = user("Riley Chen", "seller@shophub.com", hash, "seller", null, "+1 (555) 123-4567");
        user("Avery Stone", "admin@shophub.com", hash, "admin", null, "+1 (555) 000-1111");

        Address home = new Address();
        home.setUserId(buyer.getId());
        home.setLabel("Home");
        home.setName("Alex Morgan");
        home.setLine1("123 Main St");
        home.setCity("San Francisco");
        home.setState("CA");
        home.setZip("94102");
        home.setCountry("USA");
        home.setPhone("+1 (555) 999-0000");
        home.setIsDefault(true);
        addresses.save(home);

        Category electronics = category("Electronics", "electronics", "Smartphone");
        Category fashion = category("Fashion", "fashion", "Shirt");
        Category homeGarden = category("Home & Garden", "home-garden", "Sofa");
        Category beauty = category("Beauty", "beauty", "Sparkles");
        Category sports = category("Sports", "sports", "Dumbbell");
        Category toys = category("Toys & Games", "toys-games", "Gamepad2");
        Category books = category("Books", "books", "BookOpen");
        Category art = category("Art & Craft", "art-craft", "Palette");

        Shop shop = new Shop();
        shop.setUserId(seller.getId());
        shop.setBusinessName("Soundwave Store");
        shop.setSlug("soundwave-store");
        shop.setLogoKey(null);
        shop.setBannerKey(null);
        shop.setTagline("Premium audio gear for music lovers");
        shop.setDescription("We specialize in high-quality audio equipment including headphones, speakers, and accessories.");
        shop.setEmail("support@soundwave.store");
        shop.setPhone("+1 (555) 123-4567");
        shop.setAddress("123 Market St, San Francisco, CA 94103");
        shop.setPlan("standard");
        shop.setStatus("verified");
        shop.setCommissionRate(new BigDecimal("8.00"));
        shop.setRatingAvg(new BigDecimal("4.80"));
        shop.setTotalSales(128);
        shop.setCategoryId(electronics.getId());
        shops.save(shop);

        SellerApplication application = new SellerApplication();
        application.setUserId(seller.getId());
        application.setShopId(shop.getId());
        application.setBusinessName(shop.getBusinessName());
        application.setApplicantName(seller.getFullName());
        application.setEmail(seller.getEmail());
        application.setCategory("Electronics");
        application.setStatus("approved");
        application.setReviewedAt(Instant.now());
        applications.save(application);

        SellerBalance balance = new SellerBalance();
        balance.setShopId(shop.getId());
        balance.setAvailable(BigDecimal.ZERO);
        balance.setPending(BigDecimal.ZERO);
        balances.save(balance);

        Product headphones = product(shop.getId(), electronics.getId(),
                "Aurora Wireless Noise-Cancelling Headphones",
                "Aurora Wireless Noise-Cancelling Headphones by Soundwave. Crafted with premium materials and backed by a 2-year warranty.",
                "Soundwave", "248.00", "329.00", 48, new String[] {"wireless", "noise-cancelling", "bluetooth"});
        variant(headphones.getId(), "Color", new String[] {"Black", "White", "Blue"});
        variant(headphones.getId(), "Size", new String[] {"S", "M", "L"});

        Product shirt = product(shop.getId(), fashion.getId(),
                "Linen Blend Oversized Shirt",
                "Linen Blend Oversized Shirt by Northwind. A breathable everyday staple for warm weather.",
                "Northwind", "68.00", "89.00", 75, new String[] {"linen", "casual", "summer"});
        Product coffee = product(shop.getId(), homeGarden.getId(),
                "Ceramic Pour-Over Coffee Set",
                "Ceramic Pour-Over Coffee Set by Morning Co. Designed for a clean, cafe-quality brew at home.",
                "Morning Co", "54.00", null, 120, new String[] {"coffee", "ceramic", "pour-over"});
        Product serum = product(shop.getId(), beauty.getId(),
                "Vitamin C Brightening Serum",
                "Vitamin C Brightening Serum by Glow Lab. Lightweight daily serum for a brighter-looking complexion.",
                "Glow Lab", "32.00", "42.00", 200, new String[] {"vitamin-c", "serum", "brightening"});
        Product dumbbells = product(shop.getId(), sports.getId(),
                "Adjustable Cast Iron Dumbbell Set",
                "Adjustable Cast Iron Dumbbell Set by IronCore. Compact strength training without a rack of weights.",
                "IronCore", "189.00", "240.00", 36, new String[] {"dumbbell", "fitness", "adjustable"});
        Product blocks = product(shop.getId(), toys.getId(),
                "Wooden Building Blocks — 120 pcs",
                "Wooden Building Blocks — 120 pcs by Playwood. Natural wood pieces for open-ended play.",
                "Playwood", "39.00", null, 90, new String[] {"wooden", "educational", "blocks"});
        Product midnight = product(shop.getId(), books.getId(),
                "The Midnight Library — Hardcover",
                "The Midnight Library — Hardcover by Pages. A modern bestseller for your shelf.",
                "Pages", "18.00", "26.00", 150, new String[] {"fiction", "hardcover", "bestseller"});
        Product palette = product(shop.getId(), art.getId(),
                "Watercolor Travel Palette — 24 Colors",
                "Watercolor Travel Palette — 24 Colors by Pigment. Compact palette for sketching on the go.",
                "Pigment", "28.00", null, 80, new String[] {"watercolor", "travel", "palette"});
        Product watch = product(shop.getId(), electronics.getId(),
                "Smart Fitness Watch Series 6",
                "Smart Fitness Watch Series 6 by Pulse. Track workouts, heart rate, and sleep from your wrist.",
                "Pulse", "199.00", "279.00", 64, new String[] {"fitness", "smartwatch", "wearable"});
        Product tee = product(shop.getId(), fashion.getId(),
                "Organic Cotton Crewneck Tee",
                "Organic Cotton Crewneck Tee by Threadly. Soft everyday essential in breathable organic cotton.",
                "Threadly", "24.00", null, 180, new String[] {"cotton", "organic", "basic"});

        coupon("WELCOME10", "percent", "10.00", 1000);
        coupon("FREESHIP", "fixed", "0.00", 5000);
        coupon("SUMMER25", "percent", "25.00", 500);

        // No demo orders/checkouts are seeded — orders, payouts, and notifications
        // only ever exist once a real checkout happens, so every number a buyer or
        // seller sees traces to something they (or a tester) actually did.
        notify(buyer.getId(), "promo", "Flash sale — 40% off electronics", "Limited time offer on selected headphones and speakers.", false);
        notify(buyer.getId(), "system", "Welcome to ShopHub", "Complete your profile to get personalized recommendations.", true);
    }

    private User user(String name, String email, String hash, String role, String avatar, String phone) {
        User user = new User();
        user.setFullName(name);
        user.setEmail(email);
        user.setPasswordHash(hash);
        user.setRole(role);
        user.setAvatarKey(avatar);
        user.setPhone(phone);
        return users.save(user);
    }

    private Category category(String name, String slug, String icon) {
        Category category = new Category();
        category.setName(name);
        category.setSlug(slug);
        category.setIcon(icon);
        return categories.save(category);
    }

    private Product product(
            UUID shopId,
            UUID categoryId,
            String title,
            String description,
            String brand,
            String price,
            String compareAt,
            int stock,
            String[] tags) {
        Product product = new Product();
        product.setShopId(shopId);
        product.setCategoryId(categoryId);
        product.setTitle(title);
        product.setSlug(slugify(title));
        product.setDescription(description);
        product.setBrand(brand);
        product.setPrice(new BigDecimal(price));
        product.setCompareAt(compareAt == null ? null : new BigDecimal(compareAt));
        product.setStock(stock);
        product.setStatus("active");
        product.setTags(tags);
        // Rating, review count, and sales are never fabricated — they only ever
        // reflect genuine rows/decrements from real reviews and checkouts.
        product.setRatingAvg(BigDecimal.ZERO.setScale(2));
        product.setReviewCount(0);
        product.setSalesCount(0);
        products.save(product);
        return product;
    }

    private void variant(UUID productId, String name, String[] options) {
        ProductVariantDef def = new ProductVariantDef();
        def.setProductId(productId);
        def.setName(name);
        def.setOptions(options);
        variants.save(def);
    }

    private void coupon(String code, String type, String value, int limit) {
        Coupon coupon = new Coupon();
        coupon.setCode(code);
        coupon.setType(type);
        coupon.setValue(new BigDecimal(value));
        coupon.setUsageLimit(limit);
        coupon.setUsedCount(0);
        coupon.setExpiresAt(Instant.parse("2027-12-31T23:59:59Z"));
        coupon.setStatus("active");
        coupons.save(coupon);
    }

    private void notify(UUID userId, String type, String title, String body, boolean read) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setTitle(title);
        notification.setBody(body);
        if (read) {
            notification.setReadAt(Instant.now());
        }
        notifications.save(notification);
    }

    private static String slugify(String title) {
        return title.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
