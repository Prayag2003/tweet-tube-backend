import { Request, Response } from 'express'
import { AuthenticatedRequest, Tweet } from '../models'
import { ApiError, ApiResponse, AsyncHandler } from '../utils'

const createTweet = AsyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { tweetContent } = req.body
        const userId = req.user?._id

        if (!userId) {
            throw new ApiError(400, 'Unauthorized Request')
        }

        if (!tweetContent || tweetContent.trim() === '') {
            throw new ApiError(400, 'Tweet is empty.')
        }

        const tweet = await Tweet.create({
            content: tweetContent,
            owner: userId
        })

        if (!tweet) {
            throw new ApiError(400, 'Something went wrong in creating tweet')
        }

        res.status(200).json(
            new ApiResponse(
                200,
                tweet,
                `Tweet has been created for user ${userId}`
            )
        )
    }
)

const getUserTweets = AsyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params
    const page = 1
    const limit = 10

    if (!userId) {
        throw new ApiError(400, 'User not found')
    }

    const tweets = await Tweet.find({ owner: userId })
        .skip((page - 1) * limit)
        .limit(limit)

    if (!tweets || tweets.length === 0) {
        throw new ApiError(
            400,
            'Tweets not found or user has not Tweeted once yet.'
        )
    }

    res.status(200).json(
        new ApiResponse(
            200,
            tweets,
            'All the Tweets of the user have been fetched'
        )
    )
})

const updateTweet = AsyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { content } = req.body
        const userId = req.user?._id
        const { tweetId } = req.params

        if (!content || content.trim() === '') {
            throw new ApiError(403, 'Cannot send empty Tweet')
        }

        if (!userId) {
            throw new ApiError(400, 'Unauthorized request')
        }

        if (!tweetId) {
            throw new ApiError(400, 'Tweet not found')
        }

        const updatedTweet = await Tweet.findOneAndUpdate(
            { _id: tweetId, owner: userId },
            { $set: { content } },
            { new: true }
        )

        if (!updatedTweet) {
            throw new ApiError(
                400,
                "Tweet not found or user doesn't have permission to modify the Tweet"
            )
        }

        res.status(200).json(
            new ApiResponse(200, updatedTweet, 'Tweet has been updated')
        )
    }
)

const deleteTweet = AsyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
        const { tweetId } = req.params
        const userId = req.user?._id

        if (!tweetId) {
            throw new ApiError(400, 'Tweet not found')
        }

        if (!userId) {
            throw new ApiError(400, 'Unauthorized request')
        }

        const deletedTweet = await Tweet.findOneAndDelete({
            _id: tweetId,
            owner: userId
        })

        if (!deletedTweet) {
            throw new ApiError(
                400,
                'Something went wrong in deleting the Tweet or Tweet does not exist'
            )
        }

        res.status(200).json(
            new ApiResponse(
                200,
                deletedTweet,
                'Tweet has been deleted successfully'
            )
        )
    }
)

export { createTweet, deleteTweet, getUserTweets, updateTweet }
