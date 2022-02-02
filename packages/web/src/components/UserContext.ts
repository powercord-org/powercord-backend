/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

import type { SelfRestUser } from '@powercord/types/users'
import { createContext } from 'preact'

export type User = SelfRestUser & { patch: (user: Partial<SelfRestUser>) => void }

export default createContext<User | null | undefined>(void 0)
