from app.repositories.base_repository import BaseRepository
from app.repositories.user_repository import UserRepository, user_repository
from app.repositories.order_repository import (
    OrderRepository, OrderListRepository,
    order_repository, order_list_repository
)
from app.repositories.customer_repository import CustomerRepository, customer_repository
from app.repositories.dict_repository import (
    DictTypeRepository, DictDataRepository,
    dict_type_repository, dict_data_repository
)
from app.repositories.ship_repository import ShipRepository, ship_repository
from app.repositories.quote_repository import QuoteRepository, quote_repository
from app.repositories.production_repository import (
    ProductionPlanRepository, production_plan_repository,
    ProductionOrderRepository, production_order_repository,
    QualityInspectionRepository, quality_inspection_repository,
    ProductInboundRepository, product_inbound_repository,
    MaterialConsumptionRepository, material_consumption_repository,
    ProductionReportRepository, production_report_repository
)
from app.repositories.finance_repository import (
    AccountsReceivableRepository, accounts_receivable_repository,
    AccountsPayableRepository, accounts_payable_repository
)

__all__ = [
    "BaseRepository",
    "UserRepository", "user_repository",
    "OrderRepository", "OrderListRepository",
    "order_repository", "order_list_repository",
    "CustomerRepository", "customer_repository",
    "DictTypeRepository", "DictDataRepository",
    "dict_type_repository", "dict_data_repository",
    "ShipRepository", "ship_repository",
    "QuoteRepository", "quote_repository",
    "ProductionPlanRepository", "production_plan_repository",
    "ProductionOrderRepository", "production_order_repository",
    "QualityInspectionRepository", "quality_inspection_repository",
    "ProductInboundRepository", "product_inbound_repository",
    "MaterialConsumptionRepository", "material_consumption_repository",
    "ProductionReportRepository", "production_report_repository",
    "AccountsReceivableRepository", "accounts_receivable_repository",
    "AccountsPayableRepository", "accounts_payable_repository"
]
