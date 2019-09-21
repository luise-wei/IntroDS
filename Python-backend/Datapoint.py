import sys

class Datapoint:

    def __init__(self, timestamp, visibility, k_index, cloud):
        self.timestamp = timestamp
        self.visibility = visibility
        self.k_index = k_index
        self.cloud = cloud

    def __eq__(self, other):
        if isinstance(self, other.__class__):
            compare = True
            compare &= self.timestamp == other.timestamp & self.visibility == other.visibility
            compare &= self.k_index == other.k_index & self.cloud == other.cloud
            return compare
        else:
            return NotImplemented
