import { PinPadResult } from './pinpad-result';

export class SysInfoResponse {
  public rslt: PinPadResult = new PinPadResult();
  public BatteryChargingStatus: string | null = null;
  public BatteryLifePercent: number | null = null;
  public BatteryFullLifeTime: number | null = null;
  public BatteryLifeRemaining: number | null = null;
  public TabMachineName: string = '';
  public IPAddress: string = '';
  public VersionNum: string = '';
  public OS_NAME: string = '';
  public IsSuccess: boolean = false;
  public ResultData: string = '';
}
