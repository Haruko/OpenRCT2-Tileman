/// <reference path='../../lib/openrct2.d.ts' />

import { WritableStore } from 'openrct2-flexui';

export type Mapped<Source, OrigType, DestType> = {
  [Property in keyof Source] : Source[Property] extends OrigType ? DestType : Source[Property];
};

export type Storeless<Source> = {
  [Property in keyof Source] : Source[Property] extends WritableStore<infer T> ? T : Source[Property];
};

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