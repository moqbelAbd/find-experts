using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FindExpertsBackend.Models.Enums
{

    public enum UserStatusEnum
    {
        Active = 1,
        Pending = 2,
        Banned = 3,
        InActive = 4
    }

    public enum PostTypeEnum
    {
        Question = 1,
        Service = 2,
        Job = 3
    }

    public enum PostStatusEnum
    {
        Open = 1,
        Completed = 2,
        Cancelled = 3,
        Deleted = 4
    }

    public enum EmploymentTypeEnum
    {
        FullTime = 1,
        PartTime = 2,
        Contract = 3,
        Freelance = 4
    }

    public enum WorkLocationTypeEnum
    {
        OnSite = 1,
        Hybrid = 2,
        Remote = 3,

    }

    public enum BookingStatusEnum
    {
        Accepted = 1,
        Rejected = 2,
        Pending = 3,
        Completed = 4,
        Cancelled = 5
    }

    public enum NotificationTypeEnum
    {
        NewMessage = 1,
        BookingRequest = 2,
        BookingAccepted = 3,
        BookingCancelled = 4,
        NewComment = 5,
    }
}