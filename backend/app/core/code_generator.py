from datetime import datetime
import time


class Snowflake:
    """雪花算法实现"""

    def __init__(self, worker_id=0, datacenter_id=0):
        self.worker_id = worker_id
        self.datacenter_id = datacenter_id
        self.sequence = 0
        self.timestamp = 0
        self.epoch = 1577808000000
        self.worker_id_bits = 5
        self.datacenter_id_bits = 5
        self.sequence_bits = 12
        self.max_worker_id = -1 ^ (-1 << self.worker_id_bits)
        self.max_datacenter_id = -1 ^ (-1 << self.datacenter_id_bits)
        self.max_sequence = -1 ^ (-1 << self.sequence_bits)
        self.worker_id_shift = self.sequence_bits
        self.datacenter_id_shift = self.sequence_bits + self.worker_id_bits
        self.timestamp_shift = self.sequence_bits + self.worker_id_bits + self.datacenter_id_bits

    def generate(self):
        """生成雪花ID"""
        current_timestamp = int(time.time() * 1000)
        if current_timestamp < self.timestamp:
            raise Exception("Clock moved backwards")
        if current_timestamp == self.timestamp:
            self.sequence = (self.sequence + 1) & self.max_sequence
            if self.sequence == 0:
                while int(time.time() * 1000) <= current_timestamp:
                    pass
                current_timestamp = int(time.time() * 1000)
        else:
            self.sequence = 0
        self.timestamp = current_timestamp
        snowflake_id = ((current_timestamp - self.epoch) << self.timestamp_shift) | \
                       (self.datacenter_id << self.datacenter_id_shift) | \
                       (self.worker_id << self.worker_id_shift) | \
                       self.sequence
        return snowflake_id


snowflake = Snowflake()


def generate_code(prefix: str = "DH") -> str:
    """生成带前缀的编号
    
    Args:
        prefix: 编号前缀，如 PC、WO、BG、ZJ、RK、DD 等
        
    Returns:
        格式: 前缀-YYYYMMDD-xxxxxx
    """
    date_str = datetime.now().strftime('%Y%m%d')
    snowflake_id = snowflake.generate()
    random_part = str(snowflake_id)[-6:].zfill(6)
    return f"{prefix}-{date_str}-{random_part}"


CODE_PREFIXES = {
    "DD": "订单",
    "PC": "生产计划",
    "WO": "生产工单",
    "BG": "报工记录",
    "ZJ": "质检记录",
    "RK": "成品入库",
    "FH": "发货单",
    "YS": "应收账款",
    "YF": "应付账款",
    "SK": "收款记录",
    "FK": "付款记录",
    "PZ": "凭证管理",
    "YP": "样品单",
}
