/// <reference path='../../lib/openrct2.d.ts' />

import { Store } from 'openrct2-flexui';

/**
 * IDs for the data stores
 */
export enum DataStoreID {
  PLUGIN,
  PLAYER,
  PARK
};

/**
 * Maps properties of one type to another type
 */
export type Mapped<Source, OrigType, DestType> = {
  [Property in keyof Source] : Source[Property] extends OrigType ? DestType : Source[Property];
};

/**
 * Maps all Store<T> to T
 */
export type Storeless<Source> = {
  [Property in keyof Source] : Source[Property] extends Store<infer T> ? T : Source[Property];
};

/**
 * Ride data for plugin storage
 */
export type RideData = {
  // ride.name
  name : string,
  // ride.classification ('ride' | 'stall' | 'facility')
  classification : RideClassification,
  // ride.type (RideType enum)
  type : number,
  // ride.age
  age : number,
  // ride.value
  value : number,
  // ride.totalCustomers
  totalCustomers : number,
  // ride.totalProfit
  totalProfit : number,
  // ride.lifecycleFlags
  lifecycleFlags : number
};