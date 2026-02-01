/**
 * DatabaseService.ts
 * 
 * Interface and implementation for database operations in the NileLink ecosystem.
 * Provides abstraction layer for database interactions across all services.
 */

export interface DatabaseService {
  /**
   * Create a new record in the specified collection/table
   */
  create(collection: string, data: any): Promise<any>;

  /**
   * Find a record by ID
   */
  findById(collection: string, id: string): Promise<any | null>;

  /**
   * Find records by a specific field value
   */
  findByField(collection: string, field: string, value: any): Promise<any[]>;

  /**
   * Find all records in a collection
   */
  findAll(collection: string): Promise<any[]>;

  /**
   * Update a record by ID
   */
  update(collection: string, id: string, data: any): Promise<boolean>;

  /**
   * Delete a record by ID
   */
  delete(collection: string, id: string): Promise<boolean>;

  /**
   * Query records with filters and options
   */
  query(collection: string, filters: any, options?: any): Promise<any[]>;
}

// Default implementation using a mock/in-memory approach
// In a real implementation, this would connect to a proper database like PostgreSQL, MongoDB, etc.
export class MockDatabaseService implements DatabaseService {
  private collections: Map<string, Map<string, any>> = new Map();

  constructor() {
    // Initialize collections if they don't exist
    const defaultCollections = [
      'users', 'suppliers', 'supplier_inventory', 'supplier_orders', 'supplier_payouts',
      'products', 'orders', 'deliveries', 'drivers', 'merchants', 'notifications'
    ];
    
    for (const collection of defaultCollections) {
      if (!this.collections.has(collection)) {
        this.collections.set(collection, new Map());
      }
    }
  }

  async create(collection: string, data: any): Promise<any> {
    if (!this.collections.has(collection)) {
      this.collections.set(collection, new Map());
    }

    const collectionMap = this.collections.get(collection)!;
    const id = data.id || this.generateId();
    
    const record = { ...data, id };
    collectionMap.set(id, record);
    
    return record;
  }

  async findById(collection: string, id: string): Promise<any | null> {
    const collectionMap = this.collections.get(collection);
    if (!collectionMap) {
      return null;
    }
    
    return collectionMap.get(id) || null;
  }

  async findByField(collection: string, field: string, value: any): Promise<any[]> {
    const collectionMap = this.collections.get(collection);
    if (!collectionMap) {
      return [];
    }

    const results: any[] = [];
    for (const record of collectionMap.values()) {
      if (record[field] === value) {
        results.push(record);
      }
    }
    
    return results;
  }

  async findAll(collection: string): Promise<any[]> {
    const collectionMap = this.collections.get(collection);
    if (!collectionMap) {
      return [];
    }
    
    return Array.from(collectionMap.values());
  }

  async update(collection: string, id: string, data: any): Promise<boolean> {
    const collectionMap = this.collections.get(collection);
    if (!collectionMap) {
      return false;
    }

    const existingRecord = collectionMap.get(id);
    if (!existingRecord) {
      return false;
    }

    // Merge existing data with new data
    const updatedRecord = { ...existingRecord, ...data, id };
    collectionMap.set(id, updatedRecord);
    
    return true;
  }

  async delete(collection: string, id: string): Promise<boolean> {
    const collectionMap = this.collections.get(collection);
    if (!collectionMap) {
      return false;
    }

    return collectionMap.delete(id);
  }

  async query(collection: string, filters: any, options?: any): Promise<any[]> {
    const collectionMap = this.collections.get(collection);
    if (!collectionMap) {
      return [];
    }

    let results = Array.from(collectionMap.values());

    // Apply filters
    for (const [field, value] of Object.entries(filters)) {
      results = results.filter(record => record[field] == value); // Using == to handle type coercion
    }

    // Apply sorting if specified in options
    if (options?.sort) {
      const sortField = options.sort.field;
      const sortOrder = options.sort.order === 'desc' ? -1 : 1;
      
      results.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * sortOrder;
        if (a[sortField] > b[sortField]) return 1 * sortOrder;
        return 0;
      });
    }

    // Apply pagination if specified
    if (options?.limit || options?.offset) {
      const offset = options?.offset || 0;
      const limit = options?.limit || results.length;
      
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  private generateId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}