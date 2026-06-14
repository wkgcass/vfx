export enum VSceneRole {
  MAIN = 'MAIN',
  TEMPORARY = 'TEMPORARY',
  DRAWER_VERTICAL = 'DRAWER_VERTICAL',
  DRAWER_HORIZONTAL = 'DRAWER_HORIZONTAL',
  POPUP = 'POPUP',
}

interface RoleAttrs {
  manageWidth: boolean;
  manageHeight: boolean;
  showCover: boolean;
  temporary: boolean;
  centralWidth: boolean;
  centralHeight: boolean;
}

const ROLE_ATTRS: Record<VSceneRole, RoleAttrs> = {
  [VSceneRole.MAIN]: {
    manageWidth: true, manageHeight: true,
    showCover: false, temporary: false,
    centralWidth: false, centralHeight: false,
  },
  [VSceneRole.TEMPORARY]: {
    manageWidth: true, manageHeight: true,
    showCover: false, temporary: true,
    centralWidth: false, centralHeight: false,
  },
  [VSceneRole.DRAWER_VERTICAL]: {
    manageWidth: false, manageHeight: true,
    showCover: true, temporary: true,
    centralWidth: false, centralHeight: false,
  },
  [VSceneRole.DRAWER_HORIZONTAL]: {
    manageWidth: true, manageHeight: false,
    showCover: true, temporary: true,
    centralWidth: false, centralHeight: false,
  },
  [VSceneRole.POPUP]: {
    manageWidth: false, manageHeight: false,
    showCover: true, temporary: true,
    centralWidth: true, centralHeight: true,
  },
};

export function roleAttrs(r: VSceneRole): RoleAttrs {
  return ROLE_ATTRS[r];
}
