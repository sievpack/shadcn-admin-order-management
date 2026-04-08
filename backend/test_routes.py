from app.api.order.stats import router as stats_router

print("Stats Router Routes:")
for route in stats_router.routes:
    print(f"Path: {route.path}")
    print(f"Methods: {route.methods}")
    print()
