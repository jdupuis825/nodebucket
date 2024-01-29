/**
 * Title: employee.interface.ts
 * Author: Jocelyn Dupuis
 * Date: 01/18/2024
 * Description: ts file for employee interface
 */

//import statements
import { Item } from './item.interface';

//exports
export interface Employee {
  empId: number;
  todo: Item[];
  done: Item[];
}