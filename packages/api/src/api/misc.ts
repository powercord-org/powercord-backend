/*
 * Copyright (c) 2018-2022 Powercord Developers
 * Licensed under the Open Software License version 3.0
 */

// api:v2

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import type { User as DiscordUser } from '@powercord/types/discord'
import type { User } from '@powercord/types/users'
import { URL } from 'url'
import { createHash } from 'crypto'
import fetch from 'node-fetch'
import config from '@powercord/shared/config'
import { fetchUser } from '../utils/discord.js'
import { remoteFile } from '../utils/cache.js'

type AvatarRequest = { TokenizeUser: User, Params: { id: string } }

const plugXml = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 447 447">
  <path fill="#99AAB5" d="M221,117.1l-33.8-33.8l70-70c9.3-9.3,24.5-9.3,33.8,0l0,0c9.3,9.3,9.3,24.5,0,33.8L221,117.1L221,117.1z"/>
  <path fill="#23272A" d="M216.3,121.7l-33.8-33.8c-2.6-2.6-2.6-6.8,0-9.3l70-70c11.9-11.9,31.2-11.9,43.1,0s11.9,31.2,0,43.1l-70,70 C223,124.3,218.9,124.3,216.3,121.7z M196.5,83.3l24.5,24.5l65.3-65.3c6.7-6.7,6.7-17.7,0-24.5c-6.7-6.7-17.7-6.7-24.5,0L196.5,83.3 L196.5,83.3z"/>
  <path fill="#99AAB5" d="M312.7,208.8L278.9,175l70-70c9.3-9.3,24.5-9.3,33.8,0l0,0c9.3,9.3,9.3,24.5,0,33.8L312.7,208.8L312.7,208.8z"/>
  <path fill="#23272A" d="M308,213.4l-33.8-33.8c-2.6-2.6-2.6-6.8,0-9.3l70-70c11.9-11.9,31.2-11.9,43.1,0s11.9,31.2,0,43.1l-70,70 C314.8,216,310.6,216,308,213.4z M288.2,175l24.5,24.5l65.3-65.3c6.7-6.7,6.7-17.7,0-24.5s-17.7-6.7-24.5,0L288.2,175L288.2,175z"/>
  <rect fill="#23272A" x="220.8" y="42" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -42.1158 214.494)" width="34.1" height="232.1"/>
  <path fill="#23272A" d="M303,257L138.9,92.9c-2.7-2.7-2.7-7,0-9.7L163,59.1c2.7-2.7,7-2.7,9.7,0l164.1,164.1c2.7,2.7,2.7,7,0,9.7 L312.7,257C310,259.7,305.7,259.7,303,257z M153.4,88.1l154.5,154.5l14.5-14.5L167.9,73.6L153.4,88.1z"/>
  <path fill="#7289DA" d="M161.2,327.6l-92.9-92.9c-14.3-14.3-14.3-37.6,0-51.9l85.1-85.1l144.8,144.8l-85.1,85.1 C198.8,342,175.5,342,161.2,327.6z"/>
  <path fill="#23272A" d="M156.4,332.4l-92.9-92.9c-17-17-17-44.6,0-61.6l85.1-85.1c2.7-2.7,7-2.7,9.7,0L303,237.7c2.7,2.7,2.7,7,0,9.7 L218,332.4C201,349.4,173.3,349.4,156.4,332.4z M153.4,107.4l-80.2,80.2c-11.7,11.7-11.7,30.6,0,42.3l92.9,92.9 c11.7,11.7,30.6,11.7,42.3,0l80.2-80.2L153.4,107.4z"/>
  <rect fill="#23272A" x="79.8" y="275.2" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -179.6926 157.5037)" width="41" height="41"/>
  <path fill="#23272A" d="M95.4,329.5l-29-29c-2.7-2.7-2.7-7,0-9.7l29-29c2.7-2.7,7-2.7,9.7,0l29,29c2.7,2.7,2.7,7,0,9.7l-29,29 C102.4,332.1,98.1,332.1,95.4,329.5z M81,295.7l19.3,19.3l19.3-19.3l-19.3-19.3L81,295.7z"/>
  <path fill="#23272A" d="M143.7,445.3L81,382.6c-21.3-21.3-21.3-55.9,0-77.2c2.7-2.7,7-2.7,9.7,0c2.7,2.7,2.7,7,0,9.7 c-16,16-16,42,0,57.9l62.8,62.8c2.7,2.7,2.7,7,0,9.7S146.4,448,143.7,445.3z"/>
</svg>
`

function makeHibiscus (color: string) {
  return `<!--
  Original work is part of the Twemoji project (https://twemoji.twitter.com/), Copyright (c) Twitter Inc.
  Licensed under the Creative Commons Attribution 4.0 International license.
  https://creativecommons.org/licenses/by/4.0/
-->
<svg viewBox="0 0 367 367" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill="#${color}" fill-rule="evenodd" clip-rule="evenodd" d="M352.86 160.603C352.33 151.418 351.076 134.251 338.608 117.511C326.783 101.72 299.819 83.1459 282.192 91.1587C287.453 74.0728 279.501 49.1066 270.051 35.1912C258.032 17.4937 226.602 -3.98602 187.007 4.34284C173.123 7.26357 155.11 18.1613 145.593 31.6108L133.782 15.4038C128.705 8.43081 116.196 8.89975 105.849 16.4334L101.007 19.9709C97.3125 22.6605 94.3928 25.8893 92.3964 29.2468C87.3506 29.5365 82.5869 30.2367 78.4666 31.2766C57.8126 36.4859 46.3133 49.3921 40.3496 56.3651L40.3801 56.3141L40.0743 56.6607L39.7991 56.9971C33.8557 64.0211 22.9171 77.3249 20.9699 98.5293C19.0024 120.407 28.6158 157.983 51.8183 160.124C53.3373 160.267 55.1213 160.44 57.0583 160.644C33.9067 161.643 20.6437 197.895 20.4092 219.772C20.1852 241.181 29.832 255.488 35.1056 263.007L35.0892 262.986L35.1198 263.027L35.1056 263.007C35.1853 263.107 35.2869 263.239 35.3441 263.353C35.3725 263.398 35.4106 263.444 35.4501 263.492C35.5097 263.564 35.5723 263.64 35.6091 263.72C36.4099 264.842 37.3207 266.109 38.3592 267.475C37.3844 267.489 36.4144 267.503 35.4497 267.517L35.4454 267.517C27.8237 267.629 20.5332 267.737 13.7828 267.737C-0.713645 267.737 97.9889 401.702 159.482 340.209C166.758 332.938 171.29 325.939 173.506 319.367C179.601 321.936 185.702 323.755 191.085 324.662C192.68 324.932 194.246 325.143 195.782 325.298C197.031 326.699 198.38 328.124 199.832 329.576C266.187 395.901 375.726 251.395 360.088 251.395C338.008 251.395 310.327 252.339 283.463 255.188C284.446 248.04 284.506 240.869 283.242 234.482L285.2 235.777C303.815 248.255 332.4 224.37 343.359 205.826C353.801 188.212 352.899 161.748 352.861 160.639L352.86 160.603Z"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M195.782 325.298C215.01 327.25 229.54 320.715 237.469 316.986L237.457 316.993C237.58 316.921 237.717 316.858 237.836 316.803L238.254 316.599C246.797 312.521 262.701 304.59 273.547 285.607C278.091 277.618 281.918 266.431 283.463 255.188C310.327 252.339 338.008 251.395 360.088 251.395C375.726 251.395 266.187 395.901 199.832 329.576C198.38 328.124 197.031 326.699 195.782 325.298Z" fill="black" fill-opacity="0.3"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M38.3592 267.475C44.2361 275.204 54.2023 286.111 71.4426 292.02C91.4033 298.84 128.052 298.707 138.39 279.419C136.293 296.656 154.875 311.515 173.506 319.367C171.29 325.939 166.758 332.938 159.482 340.209C97.9889 401.702 -0.713645 267.737 13.7828 267.737C20.5345 267.737 27.8264 267.629 35.4497 267.517C36.4144 267.503 37.3844 267.489 38.3592 267.475Z" fill="black" fill-opacity="0.3"/>
  <path d="M280.775 138.053C262.568 127.889 231.088 133.629 211.535 141.193C208.823 136.422 205.204 132.273 200.82 129C215.021 112.618 236.766 82.1774 215.786 64.1434C193.45 44.9473 177.659 86.1023 179.341 121.283C178.647 121.253 177.995 121.079 177.292 121.079C166.903 121.079 157.514 125.178 150.46 131.733C136.177 108.52 110.273 88.4674 96.2865 107.347C81.1784 127.757 107.99 139.491 139.327 150.164C138.41 153.518 137.758 156.974 137.758 160.613C137.758 165.262 138.706 169.656 140.184 173.795C114.28 181.257 76.6113 201.503 97.2652 223.85C118.898 247.256 142.855 211.229 154.395 192.726C160.868 197.354 168.738 200.137 177.302 200.137C179.596 200.137 181.798 199.842 183.979 199.464C182.868 248.418 198.69 271.539 225.124 259.53C248.52 248.897 223.727 205.51 206.968 186.487C210.189 182.797 212.717 178.545 214.399 173.836C285.842 199.77 301.959 149.869 280.775 138.053Z" fill="black" fill-opacity="0.3"/>
  <path fill-rule="evenodd" clip-rule="evenodd" d="M161.194 71.3143C159.198 74.6695 156.281 77.8967 152.59 80.5871L147.748 84.1245C144.393 86.5649 140.812 88.264 137.331 89.2089C145.018 101.229 151.949 114.144 157.643 126.4C163.423 123.033 170.119 121.079 177.292 121.079C177.678 121.079 178.048 121.132 178.419 121.184L178.419 121.184C178.723 121.227 179.028 121.27 179.341 121.283C179.266 119.731 179.226 118.167 179.219 116.597C174.799 101.412 169.141 85.7645 161.194 71.3143Z" fill="black" fill-opacity="0.4"/>
  <path d="M162.132 54.3058C167.209 61.2788 162.938 73.0432 152.59 80.5871L147.748 84.1245C137.391 91.6582 124.882 92.1272 119.805 85.1542L91.4646 46.242C86.3877 39.269 90.6592 27.5046 101.007 19.9709L105.849 16.4334C116.196 8.89975 128.705 8.43081 133.782 15.4038L162.132 54.3058Z" fill="black" fill-opacity="0.5"/>
</svg>
`
}

function plug (request: FastifyRequest<{ Params: { color: string } }>, reply: FastifyReply): void {
  reply.type('image/svg+xml').send(plugXml.replace(/7289DA/g, request.params.color))
}

function hibiscus (request: FastifyRequest<{ Params: { color: string } }>, reply: FastifyReply): void {
  reply.type('image/svg+xml').send(makeHibiscus(request.params.color))
}

async function getDiscordAvatar (user: User, update: (user: DiscordUser) => void): Promise<Buffer> {
  if (!user.avatar) {
    return fetch(`https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator) % 6}.png`).then((r) => r.buffer())
  }

  const file = await remoteFile(new URL(`https://cdn.discordapp.com/avatars/${user._id}/${user.avatar}.png?size=256`))
  if (!file.success) {
    const discordUser = await fetchUser(user._id)
    // eslint-disable-next-line require-atomic-updates
    user.avatar = discordUser.avatar
    update(discordUser)

    return getDiscordAvatar(user, update)
  }

  return file.data
}

// This route is very restricted to prevent abuse.
// Only avatar of people shown on /contributors & authenticated user can be fetched.
async function avatar (this: FastifyInstance, request: FastifyRequest<AvatarRequest>, reply: FastifyReply): Promise<Buffer | void> {
  let user = request.user
  if (request.params.id !== request.user?._id.toString()) {
    user = await this.mongo.db!.collection<User>('users').findOne({
      _id: request.params.id,
      $or: [
        { 'badges.developer': true },
        { 'badges.staff': true },
        { 'badges.support': true },
        { 'badges.contributor': true },
      ],
    })
  }

  if (!user) {
    reply.code(422).send()
    return
  }

  const effectiveAvatarId = user.avatar ?? user.discriminator
  const etag = `W/"${createHash('sha256').update(config.secret).update(user._id).update(effectiveAvatarId).digest('base64url')}"`

  reply.type('image/png')
  reply.header('cache-control', 'public, max-age=86400')
  if (request.headers['if-none-match'] === etag) {
    reply.code(304).send()
    return
  }

  reply.header('etag', etag)
  return getDiscordAvatar(user, (newUser) => this.mongo.db!.collection<User>('users').updateOne(
    { _id: newUser.id },
    {
      $set: {
        username: newUser.username,
        discriminator: newUser.discriminator,
        avatar: newUser.avatar,
        updatedAt: new Date(),
      },
    }
  ))
}

/** @deprecated */
export default async function (fastify: FastifyInstance): Promise<void> {
  const optionalAuth = fastify.auth([ fastify.verifyTokenizeToken, (_, __, next) => next() ])

  fastify.get<AvatarRequest>('/avatar/:id(\\d+).png', { preHandler: optionalAuth }, avatar)
  fastify.get('/plug/:color([a-fA-F0-9]{6})', plug)

  // "Polyfill" for new donator perks for tier 1 & legacy donators
  fastify.get('/hibiscus/:color([a-fA-F0-9]{6}).svg', hibiscus)
}
