class Donation {
  constructor(data) {
    this.id = data.id;
    this.category_id = data.category_id;
    this.name = data.name;
    this.description = data.description;
    this.initial_quantity = data.initial_quantity || 0;
    this.current_quantity = data.current_quantity || 0;
    this.donator_name = data.donator_name;
    this.gender = data.gender;
    this.size = data.size;
    this.active = data.active !== undefined ? data.active : true;
    this.available = data.available !== undefined ? data.available : true;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
    this.category = data.category;
  }

  getUsedQuantity() {
    return this.initial_quantity - this.current_quantity;
  }

  getUsagePercentage() {
    if (this.initial_quantity === 0) return 0;
    return Math.round((this.getUsedQuantity() / this.initial_quantity) * 100);
  }

  isRunningLow() {
    return this.current_quantity < (this.initial_quantity * 0.2);
  }

  toJSON() {
    return {
      id: this.id,
      category_id: this.category_id,
      name: this.name,
      description: this.description,
      initial_quantity: this.initial_quantity,
      current_quantity: this.current_quantity,
      donator_name: this.donator_name,
      gender: this.gender,
      size: this.size,
      active: this.active,
      available: this.available,
      created_at: this.created_at,
      updated_at: this.updated_at,
      category: this.category,
      used_quantity: this.getUsedQuantity(),
      usage_percentage: this.getUsagePercentage(),
      is_running_low: this.isRunningLow()
    };
  }
}

class Category {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.measure_unity = data.measure_unity;
    this.created_at = data.created_at || new Date();
    this.active = data.active !== undefined ? data.active : true;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      measure_unity: this.measure_unity,
      created_at: this.created_at,
      active: this.active
    };
  }
}

module.exports = {
  Donation,
  Category
};
