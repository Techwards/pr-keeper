import * as core from '@actions/core'
import * as github from '@actions/github'

const client = github.getOctokit(core.getInput('token'))
const pullRequest = github.context.payload.pull_request

type CreateLabelRequest = Parameters<typeof client.rest.issues.createLabel>

type AddLabelRequest = Parameters<typeof client.rest.issues.addLabels>

type GetLabelRequest = Parameters<typeof client.rest.issues.getLabel>
type GetLabelResponse = ReturnType<typeof client.rest.issues.getLabel>

async function run(): Promise<void> {
  if (pullRequest) {
    try {
      const owner = pullRequest.base.user.login
      const repo = pullRequest.base.repo.name
      const pullRequestNumber = pullRequest.number
      const pullRequestDetails = await client.rest.pulls.get({
        owner,
        repo,
        pull_number: pullRequestNumber
      })

      const readyToReviewLabel = await getLabel({
        owner,
        repo,
        name: 'Ready for Review'
      })

      const titleRegex = core.getInput('title-regex')
      const title = pullRequestDetails.data.title
      const isPRTitleValid = validatePRField({field: title, regex: titleRegex})

      // const descriptionRegex = core.getInput('description-regex')
      // const description = pullRequestDetails.data.body ?? ''
      // const isPRDescriptionValid = validatePRField({
      //   field: description,
      //   regex: descriptionRegex
      // })

      if (
        !isPRTitleValid
        // || !isPRDescriptionValid
      ) {
        !isPRTitleValid &&
          (await client.rest.issues.createComment({
            owner,
            repo,
            issue_number: pullRequestNumber,
            body: `The format of the PR title is invalid`
          }))

        // !isPRDescriptionValid &&
        //   (await client.rest.issues.createComment({
        //     owner,
        //     repo,
        //     issue_number: pullRequestNumber,
        //     body: `The format of the PR description is invalid`
        //   }))

        throw new Error('PR is invalid')
      }

      if (!readyToReviewLabel) {
        await createLabel({
          owner,
          repo,
          name: 'Ready for Review',
          description: 'The PR is ready to review',
          color: '00FF00'
        })
      }

      await addLabels({
        repo,
        owner,
        issue_number: pullRequestNumber,
        labels: ['Ready for Review']
      })
    } catch (error) {
      core.setFailed(getErrorMessage(error))
    }
  }
}

function validatePRField(data: {field: string; regex: string}): boolean {
  const {field, regex} = data
  const regExp = new RegExp(regex, 'gm')
  const isFieldValid = regExp.test(field)

  return isFieldValid
}

async function createLabel(...body: CreateLabelRequest): Promise<void> {
  try {
    await client.rest.issues.createLabel(...body)
  } catch (error) {
    core.info(getErrorMessage(error))
  }
}
async function addLabels(...body: AddLabelRequest): Promise<void> {
  try {
    await client.rest.issues.addLabels(...body)
  } catch (error) {
    core.info(getErrorMessage(error))
  }
}

async function getLabel(
  ...body: GetLabelRequest
): Promise<GetLabelResponse | null> {
  try {
    return await client.rest.issues.getLabel(...body)
  } catch (error) {
    core.info(getErrorMessage(error))
    return null
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return String(error)
}

run()
