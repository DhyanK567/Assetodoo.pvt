import type { UserRole } from '../context/AuthContext';

export interface Department {
  id: string;
  name: string;
  headId: string; // Employee ID
  parentDeptId: string; // Department ID or 'none'
  status: 'active' | 'inactive';
}

export interface CategoryCustomField {
  name: string;
  type: 'text' | 'number' | 'date';
}

export interface AssetCategory {
  id: string;
  name: string;
  description: string;
  depreciationMethod: 'straight_line' | 'double_declining' | 'none';
  usefulLifeYears: number;
  customFields: CategoryCustomField[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  departmentId: string; // Department ID or 'none'
  role: UserRole;
}

// Initial Mock Seed Data
const DEFAULT_DEPARTMENTS: Department[] = [
  { id: 'dept_it', name: 'Information Technology', headId: 'usr_admin', parentDeptId: 'none', status: 'active' },
  { id: 'dept_ops', name: 'Operations', headId: 'usr_manager', parentDeptId: 'none', status: 'active' },
  { id: 'dept_hr', name: 'Human Resources', headId: 'usr_dept_head', parentDeptId: 'none', status: 'active' },
  { id: 'dept_fin', name: 'Finance & Compliance', headId: 'none', parentDeptId: 'none', status: 'active' },
];

const DEFAULT_CATEGORIES: AssetCategory[] = [
  { 
    id: 'cat_it', 
    name: 'IT Hardware', 
    description: 'Computers, laptops, monitors, keyboards, network devices', 
    depreciationMethod: 'straight_line', 
    usefulLifeYears: 4,
    customFields: [
      { name: 'RAM (GB)', type: 'number' },
      { name: 'Processor', type: 'text' },
      { name: 'Storage capacity', type: 'text' }
    ]
  },
  { 
    id: 'cat_furn', 
    name: 'Office Furniture', 
    description: 'Chairs, ergonomic desks, cabinets, meeting tables', 
    depreciationMethod: 'straight_line', 
    usefulLifeYears: 7,
    customFields: [
      { name: 'Material', type: 'text' },
      { name: 'Color', type: 'text' }
    ]
  },
  { 
    id: 'cat_lab', 
    name: 'Lab Equipment', 
    description: 'Oscilloscopes, microscopes, analyzers, multimeters', 
    depreciationMethod: 'double_declining', 
    usefulLifeYears: 5,
    customFields: [
      { name: 'Calibration Date', type: 'date' },
      { name: 'Model Number', type: 'text' }
    ]
  },
];

const DEFAULT_EMPLOYEES: Employee[] = [
  { id: 'usr_admin', name: 'Alex Administrator', email: 'alex.admin@odoo.pvt', departmentId: 'dept_it', role: 'admin' },
  { id: 'usr_manager', name: 'Sam Manager', email: 'sam.manager@odoo.pvt', departmentId: 'dept_ops', role: 'asset_manager' },
  { id: 'usr_dept_head', name: 'Jordan Director', email: 'jordan.head@odoo.pvt', departmentId: 'dept_hr', role: 'dept_head' },
  { id: 'usr_employee', name: 'Taylor Worker', email: 'taylor.emp@odoo.pvt', departmentId: 'dept_it', role: 'employee' },
  { id: 'usr_emp2', name: 'Morgan Staff', email: 'morgan.staff@odoo.pvt', departmentId: 'dept_ops', role: 'employee' },
  { id: 'usr_emp3', name: 'Casey Lead', email: 'casey.lead@odoo.pvt', departmentId: 'dept_fin', role: 'employee' },
];

class OrgService {
  private getStorageItem<T>(key: string, defaults: T[]): T[] {
    const data = localStorage.getItem(key);
    try {
      return data ? JSON.parse(data) : this.setStorageItem(key, defaults);
    } catch {
      return this.setStorageItem(key, defaults);
    }
  }

  private setStorageItem<T>(key: string, value: T[]): T[] {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  // --- Departments CRUD ---
  public getDepartments(): Department[] {
    return this.getStorageItem<Department>('MOCK_DB_DEPARTMENTS', DEFAULT_DEPARTMENTS);
  }

  public saveDepartment(dept: Department): Department[] {
    const list = this.getDepartments();
    const index = list.findIndex(d => d.id === dept.id);
    if (index > -1) {
      list[index] = dept;
    } else {
      list.push(dept);
    }
    return this.setStorageItem('MOCK_DB_DEPARTMENTS', list);
  }

  public deleteDepartment(id: string): Department[] {
    const list = this.getDepartments().filter(d => d.id !== id);
    return this.setStorageItem('MOCK_DB_DEPARTMENTS', list);
  }

  // --- Categories CRUD ---
  public getCategories(): AssetCategory[] {
    return this.getStorageItem<AssetCategory>('MOCK_DB_CATEGORIES', DEFAULT_CATEGORIES);
  }

  public saveCategory(cat: AssetCategory): AssetCategory[] {
    const list = this.getCategories();
    const index = list.findIndex(c => c.id === cat.id);
    if (index > -1) {
      list[index] = cat;
    } else {
      list.push(cat);
    }
    return this.setStorageItem('MOCK_DB_CATEGORIES', list);
  }

  public deleteCategory(id: string): AssetCategory[] {
    const list = this.getCategories().filter(c => c.id !== id);
    return this.setStorageItem('MOCK_DB_CATEGORIES', list);
  }

  // --- Employees CRUD ---
  public getEmployees(): Employee[] {
    return this.getStorageItem<Employee>('MOCK_DB_EMPLOYEES', DEFAULT_EMPLOYEES);
  }

  public saveEmployee(emp: Employee): Employee[] {
    const list = this.getEmployees();
    const index = list.findIndex(e => e.id === emp.id);
    if (index > -1) {
      list[index] = emp;
    } else {
      list.push(emp);
    }
    return this.setStorageItem('MOCK_DB_EMPLOYEES', list);
  }

  public updateEmployeeRole(id: string, role: UserRole): Employee[] {
    const list = this.getEmployees();
    const index = list.findIndex(e => e.id === id);
    if (index > -1) {
      list[index].role = role;
      console.log(`[OrgService] Employee ID "${id}" promoted to: ${role.toUpperCase()}`);
      
      // If we promote the active session user, update their session too
      const session = localStorage.getItem('MOCK_USER_SESSION');
      if (session) {
        try {
          const userObj = JSON.parse(session);
          if (userObj.id === id) {
            userObj.role = role;
            localStorage.setItem('MOCK_USER_SESSION', JSON.stringify(userObj));
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    return this.setStorageItem('MOCK_DB_EMPLOYEES', list);
  }
}

export const orgService = new OrgService();
